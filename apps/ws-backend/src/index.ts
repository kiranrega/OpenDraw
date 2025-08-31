import  {WebSocketServer} from "ws"
import JWT, { JwtPayload } from 'jsonwebtoken'

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws, req) {
  const url = req.url;
  if (!url) {
    return;
  }
  const quryParameters = new URLSearchParams(url.split("?")[1])
  const token = quryParameters.get("token") 
  const JWT_SCREAT = process.env.JWT_SCREAT
  const decoded = JWT.verify(token || "", JWT_SCREAT || "")
  if (!decoded || !(decoded as JwtPayload).email ) {
    ws.close()
    return;
  }
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});