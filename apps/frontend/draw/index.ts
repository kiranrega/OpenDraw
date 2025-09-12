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


export function initDraw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    let existingShape: Shape[] = []

    if (!ctx) {
        return
    }
    ctx.fillStyle = "rgba(0, 0, 0)"
    ctx.fillRect(0,0, canvas.width, canvas.height)

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
        existingShape.push({
            type: "rect",
            width,
            height,
            x: startX,
            y: startY
        })
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