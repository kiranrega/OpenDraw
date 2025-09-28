import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";

require("dotenv").config();
const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  const JWT_SCREAT = process.env.JWT_SCREAT;
  try {
    if (!JWT_SCREAT) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SCREAT);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.foundUserId) {
      return null;
    }

    return decoded.foundUserId;
  } catch (e) {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token");
  if (!token) return;
  const userId = checkUser(token);
  if (userId == null) {
    ws.close();
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }

    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws === ws);
      if (user && !user.rooms.includes(String(parsedData.roomId))) {
        user.rooms.push(String(parsedData.roomId));
      }
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) return;
      user.rooms = user.rooms.filter((x) => x !== String(parsedData.roomId));
    }

    if (parsedData.type === "chat") {
      const roomId = String(parsedData.roomId);
      const message = parsedData.message;

      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId,
        },
      });
      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              roomId,
            })
          );
        }
      });
    } else if (parsedData.type === 'delete_shape') {
        // Delete shape from database
        const { roomId, shapeId } = parsedData;
        
        try {
          // Find all chat messages in the room
          const chatMessages = await prismaClient.chat.findMany({
            where: {
              roomId: Number(roomId)
            }
          });
          
          // Find the chat message that contains the shape with matching shapeId
          for (const chatMessage of chatMessages) {
            try {
              const parsedMessage = JSON.parse(chatMessage.message);
              if (parsedMessage.shape && parsedMessage.shape.id === shapeId) {
                // Delete this chat message
                await prismaClient.chat.delete({
                  where: {
                    id: chatMessage.id
                  }
                });
                break;
              }
            } catch (e) {
              // Skip invalid JSON messages
              continue;
            }
          }
        } catch (error) {
          console.error('Error deleting shape from database:', error);
        }
        
        // Broadcast the delete event to all clients in the room
        users.forEach(client => {
          if (client.rooms.includes(String(roomId))) {
            client.ws.send(JSON.stringify({
              type: 'delete_shape',
              shapeId,
              roomId
            }));
          }
        });
    }
  });
});
