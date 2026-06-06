import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prismaClient } from "@repo/db/client";
import { ChatMessageSchema } from "@repo/common/types";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
const wss = new WebSocketServer({ port: PORT });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  const JWT_SECRET = process.env.JWT_SECRET;
  try {
    if (!JWT_SECRET) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

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

      try {
        // Validate message contains a properly formatted shape
        const parsedMessage = JSON.parse(message);
        const validation = ChatMessageSchema.safeParse(parsedMessage);
        
        if (!validation.success) {
          console.warn("Invalid shape data received:", validation.error);
          ws.send(JSON.stringify({
            type: "error",
            message: "Invalid shape format"
          }));
          return;
        }

        // If a shape with this ID already exists in the room, update it. Otherwise, create a new one.
        let chatRecord = null;
        try {
          const roomChats = await prismaClient.chat.findMany({
            where: {
              roomId: Number(roomId)
            }
          });
          for (const chat of roomChats) {
            try {
              const parsed = JSON.parse(chat.message);
              if (parsed.shape && parsed.shape.id === validation.data.shape.id) {
                chatRecord = chat;
                break;
              }
            } catch (e) {}
          }
        } catch (dbErr) {
          console.error("Error searching existing shape:", dbErr);
        }

        if (chatRecord) {
          await prismaClient.chat.update({
            where: {
              id: chatRecord.id
            },
            data: {
              message
            }
          });
        } else {
          await prismaClient.chat.create({
            data: {
              roomId: Number(roomId),
              message,
              userId,
            },
          });
        }

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
      } catch (error) {
        console.error("Error processing chat message:", error);
        ws.send(JSON.stringify({
          type: "error",
          message: "Failed to process message"
        }));
      }
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

  ws.on("close", () => {
    const idx = users.findIndex((u) => u.ws === ws);
    if (idx !== -1) users.splice(idx, 1);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

console.log(`✅ WebSocket server running on port ${PORT}`);
