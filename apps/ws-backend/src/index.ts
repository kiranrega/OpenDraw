import  {WebSocket, WebSocketServer} from "ws"
import JWT, { JwtPayload } from 'jsonwebtoken'
import { prismaClient } from "@repo/db/client"

require("dotenv").config();

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

let users: User[] = []

function checkUser(token: string | null) {
  const JWT_SCREAT = process.env.JWT_SCREAT;
  try {
    const decoded = JWT.verify(token || "", JWT_SCREAT || "") as JwtPayload;
    if (!decoded || !decoded.foundUserId) {
      return null;
    }
    return decoded.foundUserId;
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}

wss.on('connection', function connection(ws, req) {
  const url = req.url;
  if (!url) {
    return;
  }
  const quryParameters = new URLSearchParams(url.split("?")[1])
  const token = quryParameters.get("token") 
  const userId = checkUser(token)

  if (!userId) {
    ws.close(1008, "Unauthorised")
    return;
  }

  users.push({
    ws,
    userId: userId,
    rooms:[]
  })
  
  ws.on('message', async function message(data) {
    const parsedData = JSON.parse(data as unknown as string)

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws == ws)
      user?.rooms.push(parsedData.roomId)
    }

    if (parsedData.type === 'leave_room' ) {
      const user = users.find(x => x.ws == ws)
      if(!user) {
        return;
      }
      user.rooms = user?.rooms.filter(x => x === parsedData.room)
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId
      const message = parsedData.message

      await prismaClient.chat.create({
        data:{
          message,
          roomId,
          userId
        }
      })

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "chat",
            message: message,
            roomId
          }))
        }
      }) 
    }
  });

});