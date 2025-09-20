import { BACKEND_URL } from "@/config";
import axios from "axios";

type Shape = {
    type: "rect",
    width: number,
    height: number,
    x: number,
    y: number
} | {
    type: "circle",
    width: number,
    height: number,
    radius: number
}


export async function initDraw(canvas: HTMLCanvasElement, roomId: number, socket: WebSocket) {
    const ctx = canvas.getContext('2d');
    let existingShape: Shape[] =  await getExistingShapes(roomId);

    if (!ctx) {
        return
    }

    socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data)

        if (parsedData.type === 'chat') {
            const parsedShape = JSON.parse(parsedData.message)
            console.log(parsedShape, "prasedShape")
            existingShape.push(parsedShape.shape)
            clearCanvas(existingShape, ctx, canvas)
        }
    }

    clearCanvas(existingShape, ctx, canvas)

    let clicked = false
    let startX = 0;
    let startY = 0; 
    canvas.addEventListener('mousedown', (e) => {
        clicked = true
        startX = e.clientX
        startY = e.clientY
    })

        canvas.addEventListener('mouseup', (e) => {
        clicked = false
        const width = e.clientX - startX
        const height = e.clientY - startY
        const shape:Shape = {
            type: "rect",
            width,
            height,
            x: startX,
            y: startY
        }
        existingShape.push(shape)
        socket.send(JSON.stringify({
            type:"chat",
            message: JSON.stringify({
                shape
            }),
            roomId
        }))
    })

    canvas.addEventListener('mousemove', (e) => {
        if (clicked) {
            const width = e.clientX - startX
            const height = e.clientY - startY
            clearCanvas(existingShape, ctx, canvas)
            ctx.strokeRect(startX, startY, width, height);
            ctx.strokeStyle = "rgba(255, 255, 255)"
        }
    })
}


function clearCanvas(existingShape: Shape[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(0, 0, 0)"
    ctx.fillRect(0,0, canvas.width, canvas.height)

    existingShape.map((shape) => {
       if (shape.type == "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            ctx.strokeStyle = "rgba(255, 255, 255)"
       }
    })
}

async function getExistingShapes(roomId:number) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    const messages = res.data.messages
    
    const shapes = messages.map((shape:{message:string}) => {
        return JSON.parse(shape.message).shape
    })
    console.log(shapes)
    return shapes
}