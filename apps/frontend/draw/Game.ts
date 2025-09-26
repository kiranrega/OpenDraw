import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private viewportTransform = {
        x: 0,
        y: 0,
        scale: 1
    }

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initMouseHandlers();
        this.initHandlers();
    }

    updatePanning = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;

        this.viewportTransform.x += localX - this.startX;
        this.viewportTransform.y += localY - this.startY;

        this.startX = localX;
        this.startY = localY;
    }

    render() {
        // Clear the entire canvas first
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply viewport transformation
        this.ctx.setTransform(
            this.viewportTransform.scale,
            0,
            0,
            this.viewportTransform.scale,
            this.viewportTransform.x,
            this.viewportTransform.y
        );
        
        // Draw all shapes with the transformation applied
        this.drawAllShapes();
    }
    
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: "circle" | "pencil" | "rect" | "hand") {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.render(); 
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.render(); 
            }
        }
    }

    
    drawAllShapes() {
        // Set black background
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(
            -this.viewportTransform.x / this.viewportTransform.scale,
            -this.viewportTransform.y / this.viewportTransform.scale,
            this.canvas.width / this.viewportTransform.scale,
            this.canvas.height / this.viewportTransform.scale
        );
        
        // Set default stroke for all shapes
        this.ctx.strokeStyle = "#fff";
        this.ctx.lineWidth = 1;
        
        this.existingShapes.forEach((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "pencil") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        });
    }

    getCanvasCoordinates(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - this.viewportTransform.x) / this.viewportTransform.scale,
            y: (e.clientY - rect.top - this.viewportTransform.y) / this.viewportTransform.scale
        };
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        const coords = this.getCanvasCoordinates(e);
        this.startX = coords.x;
        this.startY = coords.y;
    }

    mouseUpHandler = (e: MouseEvent) => {
        if (!this.clicked) return;
        
        this.clicked = false;
        
        if (this.selectedTool === "hand") {
            return; 
        }

        const coords = this.getCanvasCoordinates(e);
        const endX = coords.x;
        const endY = coords.y;
        const width = endX - this.startX;
        const height = endY - this.startY;

        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;
        
        if (selectedTool === "rect") {
            shape = {
                type: "rect",
                x: Math.min(this.startX, endX), 
                y: Math.min(this.startY, endY),
                width: Math.abs(width),
                height: Math.abs(height)
            }
        } else if (selectedTool === "circle") {
            const radius = Math.sqrt(width * width + height * height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: (this.startX + endX) / 2,
                centerY: (this.startY + endY) / 2,
            }
        } else if (selectedTool === "pencil") {
            shape = {
                type: "pencil",
                startX: this.startX,
                startY: this.startY,
                endX: endX,
                endY: endY,
            }
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);
        this.render(); 

        // Send to other users
        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }));
    }

    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            if (this.selectedTool === "hand") {
                this.updatePanning(e);
                this.render();
                return;
            }

            // For drawing tools, show preview
            const coords = this.getCanvasCoordinates(e);
            const currentX = coords.x;
            const currentY = coords.y;
            const width = currentX - this.startX;
            const height = currentY - this.startY;
            
            // Redraw everything plus the preview
            this.render();
            
            // Draw preview shape
            this.ctx.strokeStyle = "#fff";
            this.ctx.setLineDash([5, 5]); // Dashed line for preview
            
            if (this.selectedTool === "rect") {
                this.ctx.strokeRect(
                    Math.min(this.startX, currentX),
                    Math.min(this.startY, currentY),
                    Math.abs(width),
                    Math.abs(height)
                );
            } else if (this.selectedTool === "circle") {
                const radius = Math.sqrt(width * width + height * height) / 2;
                const centerX = (this.startX + currentX) / 2;
                const centerY = (this.startY + currentY) / 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (this.selectedTool === "pencil") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            
            this.ctx.setLineDash([]); // Reset to solid lines
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}