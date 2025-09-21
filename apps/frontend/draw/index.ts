    // import { BACKEND_URL } from "@/config";
    // import axios from "axios";
    // import { getExistingShapes } from "./http";

    // type Shape = {
    //     type: "rect",
    //     width: number,
    //     height: number,
    //     x: number,
    //     y: number
    // } | {
    //     type: "circle",
    //     centerX : number,
    //     centerY: number,
    //     radius: number,

    // }


    // export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    //     const ctx = canvas.getContext('2d');
    //     let existingShape: Shape[] =  await getExistingShapes(roomId);

    //     if (!ctx) {
    //         return
    //     }

    //     socket.onmessage = (event) => {
    //         const parsedData = JSON.parse(event.data)

    //         if (parsedData.type === 'chat') {
    //             const parsedShape = JSON.parse(parsedData.message)
    //             existingShape.push(parsedShape.shape)
    //             clearCanvas(existingShape, ctx, canvas)
    //         }
    //     }

    //     clearCanvas(existingShape, ctx, canvas)

    //     let clicked = false
    //     let startX = 0;
    //     let startY = 0; 
    //     canvas.addEventListener('mousedown', (e) => {
    //         clicked = true
    //         startX = e.clientX
    //         startY = e.clientY
    //     })

    //         canvas.addEventListener('mouseup', (e) => {
    //         clicked = false
    //         const width = e.clientX - startX
    //         const height = e.clientY - startY
    //         let shape:Shape | null = null;
    //         //@ts-ignore 
    //         const selectedTool = window.selectedTool
    //         if (selectedTool === 'rect') {
    //             shape = {
    //                 type: "rect",
    //                 width,
    //                 height,
    //                 x: startX,
    //                 y: startY
    //             }
    //         } else if (selectedTool === 'circle'){
    //             const radius = Math.max(width, height) / 2
    //             shape = {
    //                 type: "circle",
    //                 radius: radius,
    //                 centerX: startX+radius,
    //                 centerY: startY+radius
    //             }
    //         }
            
    //         if (!shape) {
    //             return ;
    //         }

    //         existingShape.push(shape)

    //         socket.send(JSON.stringify({
    //             type:"chat",
    //             message: JSON.stringify({
    //                 shape
    //             }),
    //             roomId
    //         }))
    //     })

    //     canvas.addEventListener('mousemove', (e) => {
    //         if (clicked) {
    //             const width = e.clientX - startX
    //             const height = e.clientY - startY
    //             ctx.strokeStyle = "rgba(255, 255, 255)"
    //             clearCanvas(existingShape, ctx, canvas)
    //             //@ts-ignore
    //             const selectedTool = window.selectedTool 
    //             if ( selectedTool=== "rect") {
    //                 ctx.strokeRect(startX, startY, width, height);
    //             } else if (selectedTool === "circle") {
    //                 const radius = Math.abs(Math.max(width, height) / 2 )
    //                 const centerX = startX + radius
    //                 const centerY = startY + radius
    //                 ctx.beginPath()
    //                 ctx.arc(centerX, centerY, radius, 0, Math.PI*2)
    //                 ctx.stroke()
    //                 ctx.closePath()
    //             }
                
    //         }
    //     })
    // }


    // function clearCanvas(existingShape: Shape[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height)
    //     ctx.fillStyle = "rgba(0, 0, 0)"
    //     ctx.fillRect(0,0, canvas.width, canvas.height)

    //     existingShape.map((shape) => {
    //        if (shape.type == "rect") {
    //             ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    //             ctx.strokeStyle = "rgba(255, 255, 255)"
    //        } else if (shape.type === "circle" ) {
    //             ctx.beginPath()
    //             ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI*2)
    //             ctx.stroke()
    //        }
    //     })
    // }
