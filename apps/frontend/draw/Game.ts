import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

// 1. Updated Shape type with `id` and new shapes
type Shape =
  | {
      id: string;
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      id: string;
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      id: string;
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      id: string;
      type: "rhombus";
      centerX: number;
      centerY: number;
      width: number;
      height: number;
    }
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      text: string;
      fontSize: number;
    };

// 2. Collision detection helper function
function isPointInShape(
  point: { x: number; y: number },
  shape: Shape
): boolean {
  if (shape.type === "rect") {
    return (
      point.x >= shape.x &&
      point.x <= shape.x + shape.width &&
      point.y >= shape.y &&
      point.y <= shape.y + shape.height
    );
  }
  if (shape.type === "circle") {
    const distance = Math.sqrt(
      (point.x - shape.centerX) ** 2 + (point.y - shape.centerY) ** 2
    );
    return distance <= shape.radius;
  }
  if (shape.type === "pencil") {
    // A simple check for proximity to a line segment
    const denominator = Math.sqrt(
      (shape.endY - shape.startY) ** 2 + (shape.endX - shape.startX) ** 2
    );
    if (denominator === 0) {
      // If it's a point (start and end are the same), check distance to that point
      const distance = Math.sqrt(
        (point.x - shape.startX) ** 2 + (point.y - shape.startY) ** 2
      );
      return distance < 5;
    }
    const dist =
      Math.abs(
        (shape.endY - shape.startY) * point.x -
          (shape.endX - shape.startX) * point.y +
          shape.endX * shape.startY -
          shape.endY * shape.startX
      ) / denominator;
    return dist < 5; // 5 pixels tolerance
  }
  if (shape.type === "rhombus") {
    // Check if point is inside the rhombus polygon
    const dx = Math.abs(point.x - shape.centerX);
    const dy = Math.abs(point.y - shape.centerY);
    return dx / (shape.width / 2) + dy / (shape.height / 2) <= 1;
  }
  if (shape.type === "text") {
    // Approximate bounding box for text
    const width = shape.text.length * (shape.fontSize / 2); // Approximation
    return (
      point.x >= shape.x &&
      point.x <= shape.x + width &&
      point.y <= shape.y &&
      point.y >= shape.y - shape.fontSize
    );
  }
  return false;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "pencil";
  private viewportTransform = {
    x: 0,
    y: 0,
    scale: 1,
  };

  private startPanScreenX = 0;
  private startPanScreenY = 0;
  private initialViewport = { x: 0, y: 0, scale: 1 };
  private minScale = 0.2;
  private maxScale = 4;

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
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    this.viewportTransform.x =
      this.initialViewport.x + (screenX - this.startPanScreenX);
    this.viewportTransform.y =
      this.initialViewport.y + (screenY - this.startPanScreenY);
  };

  wheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const oldScale = this.viewportTransform.scale;
    const zoomFactor = 1.1;
    const delta = e.deltaY;
    const scaleFactor = delta < 0 ? zoomFactor : 1 / zoomFactor;
    let newScale = oldScale * scaleFactor;
    newScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
    if (newScale === oldScale) return;

    const worldX = (mouseX - this.viewportTransform.x) / oldScale;
    const worldY = (mouseY - this.viewportTransform.y) / oldScale;

    this.viewportTransform.scale = newScale;

    this.viewportTransform.x = mouseX - worldX * newScale;
    this.viewportTransform.y = mouseY - worldY * newScale;

    this.render();
  };

  render() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.setTransform(
      this.viewportTransform.scale,
      0,
      0,
      this.viewportTransform.scale,
      this.viewportTransform.x,
      this.viewportTransform.y
    );

    this.drawAllShapes();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("wheel", this.wheelHandler as any);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    // Ensure all existing shapes have IDs
    this.existingShapes = this.existingShapes.map((shape) => {
      if (!shape.id) {
        return { ...shape, id: `${Date.now()}-${Math.random()}` };
      }
      return shape;
    });
    this.render();
  }

  // 3. Updated handler for `delete_shape` messages
  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        // Add ID if it's missing from old shapes in DB
        if (!parsedShape.shape.id) {
          parsedShape.shape.id = `${Date.now()}-${Math.random()}`;
        }
        this.existingShapes.push(parsedShape.shape);
        this.render();
      } else if (message.type === "delete_shape") {
        // Handle delete event
        const { shapeId } = message;
        this.existingShapes = this.existingShapes.filter(
          (s) => s.id !== shapeId
        );
        this.render();
      }
    };
  }

  // 4. Updated drawing logic
  drawAllShapes() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(
      -this.viewportTransform.x / this.viewportTransform.scale,
      -this.viewportTransform.y / this.viewportTransform.scale,
      this.canvas.width / this.viewportTransform.scale,
      this.canvas.height / this.viewportTransform.scale
    );

    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 1;

    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "rhombus") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.centerX, shape.centerY - shape.height / 2); // Top
        this.ctx.lineTo(shape.centerX + shape.width / 2, shape.centerY); // Right
        this.ctx.lineTo(shape.centerX, shape.centerY + shape.height / 2); // Bottom
        this.ctx.lineTo(shape.centerX - shape.width / 2, shape.centerY); // Left
        this.ctx.closePath();
        this.ctx.stroke();
      } else if (shape.type === "text") {
        this.ctx.font = `${shape.fontSize}px sans-serif`;
        this.ctx.fillStyle = "#fff"; // Text should be filled
        this.ctx.fillText(shape.text, shape.x, shape.y);
      }
    });
  }

  getCanvasCoordinates(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x:
        (e.clientX - rect.left - this.viewportTransform.x) /
        this.viewportTransform.scale,
      y:
        (e.clientY - rect.top - this.viewportTransform.y) /
        this.viewportTransform.scale,
    };
  }

  // Helper method to delete shapes at coordinates
  private deleteShapeAtCoordinates(coords: { x: number; y: number }) {
    let shapeToDelete: Shape | null = null;
    // Iterate backwards to delete the top-most shape (last drawn)
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const shape = this.existingShapes[i];
      const isInside = isPointInShape(coords, shape);
      if (isInside) {
        shapeToDelete = shape;
        break;
      }
    }

    if (shapeToDelete) {
      // Delete locally first
      this.existingShapes = this.existingShapes.filter(
        (s) => s.id !== shapeToDelete!.id
      );
      this.render();

      const deleteMessage = {
        type: "delete_shape",
        shapeId: shapeToDelete.id,
        roomId: this.roomId,
      };
      this.socket.send(JSON.stringify(deleteMessage));
      return true; // Shape was deleted
    }
    return false; // No shape found
  }

  // 5. Updated handler for erase tool
  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;

    if (this.selectedTool === "erase") {
      const coords = this.getCanvasCoordinates(e);
      this.deleteShapeAtCoordinates(coords);
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (this.selectedTool === "hand") {
      this.startPanScreenX = screenX;
      this.startPanScreenY = screenY;
      this.initialViewport = { ...this.viewportTransform };
    } else {
      const coords = this.getCanvasCoordinates(e);
      this.startX = coords.x;
      this.startY = coords.y;
    }
  };

  // 6. Updated handler for new shape creation
  mouseUpHandler = (e: MouseEvent) => {
    if (!this.clicked) return;
    this.clicked = false;

    if (this.selectedTool === "hand" || this.selectedTool === "erase") {
      return;
    }

    const coords = this.getCanvasCoordinates(e);
    const endX = coords.x;
    const endY = coords.y;
    const width = endX - this.startX;
    const height = endY - this.startY;

    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;
    const shapeId = `${Date.now()}-${Math.random()}`;

    if (selectedTool === "rect") {
      shape = {
        id: shapeId,
        type: "rect",
        x: Math.min(this.startX, endX),
        y: Math.min(this.startY, endY),
        width: Math.abs(width),
        height: Math.abs(height),
      };
    } else if (selectedTool === "circle") {
      // Circle is drawn from center to edge, so radius is distance from startX/Y to endX/Y
      const radius = Math.sqrt(
        (endX - this.startX) * (endX - this.startX) +
          (endY - this.startY) * (endY - this.startY)
      );
      shape = {
        id: shapeId,
        type: "circle",
        radius: radius,
        centerX: this.startX, // Center is the start point for this definition
        centerY: this.startY,
      };
    } else if (selectedTool === "pencil") {
      shape = {
        id: shapeId,
        type: "pencil",
        startX: this.startX,
        startY: this.startY,
        endX: endX,
        endY: endY,
      };
    } else if (selectedTool === "rhombus") {
      // Width and Height are total dimensions
      shape = {
        id: shapeId,
        type: "rhombus",
        centerX: (this.startX + endX) / 2,
        centerY: (this.startY + endY) / 2,
        width: Math.abs(width),
        height: Math.abs(height),
      };
    } else if (selectedTool === "text") {
      const text = prompt("Enter text:", "");
      if (text) {
        shape = {
          id: shapeId,
          type: "text",
          x: this.startX,
          y: this.startY,
          text: text,
          fontSize: 24,
        };
      }
    }

    if (!shape) {
      return;
    }

    this.existingShapes.push(shape);
    this.render();

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
  };

  // 7. Updated handler for new shape previews
  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    if (this.selectedTool === "hand") {
      this.updatePanning(e);
      this.render();
      return;
    }

    if (this.selectedTool === "erase") {
      // Delete shapes as we drag the eraser
      const coords = this.getCanvasCoordinates(e);
      this.deleteShapeAtCoordinates(coords);
      return;
    }

    const coords = this.getCanvasCoordinates(e);
    const currentX = coords.x;
    const currentY = coords.y;
    const width = currentX - this.startX;
    const height = currentY - this.startY;

    this.render();

    this.ctx.strokeStyle = "#fff";
    this.ctx.setLineDash([5, 5]);

    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(
        Math.min(this.startX, currentX),
        Math.min(this.startY, currentY),
        Math.abs(width),
        Math.abs(height)
      );
    } else if (this.selectedTool === "circle") {
      // Preview circle from center (startX/Y) to current mouse position
      const radius = Math.sqrt(
        (currentX - this.startX) * (currentX - this.startX) +
          (currentY - this.startY) * (currentY - this.startY)
      );
      this.ctx.beginPath();
      this.ctx.arc(this.startX, this.startY, Math.abs(radius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "pencil") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "rhombus") {
      // FIX: Use Math.abs(width) and Math.abs(height) for consistent rendering
      const centerX = (this.startX + currentX) / 2;
      const centerY = (this.startY + currentY) / 2;
      const halfWidth = Math.abs(width) / 2;
      const halfHeight = Math.abs(height) / 2;

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - halfHeight); // Top
      this.ctx.lineTo(centerX + halfWidth, centerY); // Right
      this.ctx.lineTo(centerX, centerY + halfHeight); // Bottom
      this.ctx.lineTo(centerX - halfWidth, centerY); // Left
      this.ctx.closePath();
      this.ctx.stroke();
    }

    this.ctx.setLineDash([]);
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("wheel", this.wheelHandler as any, {
      passive: false,
    });
  }

  resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.render();
  }
}
