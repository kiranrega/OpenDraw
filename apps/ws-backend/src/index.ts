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
  console.log(userId, "userId")
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
      console.log(users, roomId)
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
    }
  });
});
