import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

// Extended Shape type supporting styling parameters and arrow shapes
type Shape =
  | {
      id: string;
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      color?: string;
      strokeWidth?: number;
      isDashed?: boolean;
    }
  | {
      id: string;
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
      color?: string;
      strokeWidth?: number;
      isDashed?: boolean;
    }
  | {
      id: string;
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color?: string;
      strokeWidth?: number;
      isDashed?: boolean;
    }
  | {
      id: string;
      type: "rhombus";
      centerX: number;
      centerY: number;
      width: number;
      height: number;
      color?: string;
      strokeWidth?: number;
      isDashed?: boolean;
    }
  | {
      id: string;
      type: "arrow";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      color?: string;
      strokeWidth?: number;
      isDashed?: boolean;
    }
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      text: string;
      fontSize: number;
      color?: string;
    };

// Collision detection helper function supporting arrows
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
  if (shape.type === "pencil" || shape.type === "arrow") {
    const denominator = Math.sqrt(
      (shape.endY - shape.startY) ** 2 + (shape.endX - shape.startX) ** 2
    );
    if (denominator === 0) {
      const distance = Math.sqrt(
        (point.x - shape.startX) ** 2 + (point.y - shape.startY) ** 2
      );
      return distance < 6;
    }
    const dist =
      Math.abs(
        (shape.endY - shape.startY) * point.x -
          (shape.endX - shape.startX) * point.y +
          shape.endX * shape.startY -
          shape.endY * shape.startX
      ) / denominator;
    return dist < 6; // 6 pixels tolerance
  }
  if (shape.type === "rhombus") {
    const dx = Math.abs(point.x - shape.centerX);
    const dy = Math.abs(point.y - shape.centerY);
    return dx / (shape.width / 2) + dy / (shape.height / 2) <= 1;
  }
  if (shape.type === "text") {
    const width = shape.text.length * (shape.fontSize / 2);
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
  private roomId: number;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "pencil";
  
  // Style configurations
  private strokeColor = "#ffffff";
  private strokeWidth = 1;
  private isDashed = false;

  // History stacks
  private undoStack: Shape[][] = [];
  private redoStack: Shape[][] = [];

  // Selection state
  private selectedShape: Shape | null = null;
  private dragStartCoords = { x: 0, y: 0 };
  private isDragging = false;

  // Laser Pointer State
  private laserPoints: { x: number; y: number; time: number }[] = [];
  private laserTimeout: any = null;
  private isLaserDrawing = false;

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
    
    const numericRoomId = typeof roomId === 'string' ? parseInt(roomId, 10) : roomId;
    if (isNaN(numericRoomId) || numericRoomId <= 0) {
      console.error("Invalid room ID:", roomId);
      throw new Error("Invalid room ID provided");
    }
    this.roomId = numericRoomId;
    
    this.socket = socket;
    this.clicked = false;
    this.init();
    this.initMouseHandlers();
    this.initHandlers();
  }

  // Style Setters
  setStrokeColor(color: string) {
    this.strokeColor = color;
  }

  setStrokeWidth(width: number) {
    this.strokeWidth = width;
  }

  setDashed(dashed: boolean) {
    this.isDashed = dashed;
  }

  // History Actions
  private saveHistory() {
    const shapesCopy = JSON.parse(JSON.stringify(this.existingShapes));
    this.undoStack.push(shapesCopy);
    this.redoStack = []; // Clear redo stack on new actions
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  }

  undo() {
    if (this.undoStack.length === 0) return;
    const previousState = this.undoStack.pop()!;
    this.redoStack.push(JSON.parse(JSON.stringify(this.existingShapes)));
    this.syncShapesDiff(this.existingShapes, previousState);
    this.existingShapes = previousState;
    this.render();
  }

  redo() {
    if (this.redoStack.length === 0) return;
    const nextState = this.redoStack.pop()!;
    this.undoStack.push(JSON.parse(JSON.stringify(this.existingShapes)));
    this.syncShapesDiff(this.existingShapes, nextState);
    this.existingShapes = nextState;
    this.render();
  }

  private syncShapesDiff(currentState: Shape[], targetState: Shape[]) {
    const targetMap = new Map(targetState.map((s) => [s.id, s]));
    const currentMap = new Map(currentState.map((s) => [s.id, s]));

    // 1. Delete shapes missing from target
    for (const shape of currentState) {
      if (!targetMap.has(shape.id)) {
        this.socket.send(
          JSON.stringify({
            type: "delete_shape",
            shapeId: shape.id,
            roomId: this.roomId,
          })
        );
      }
    }

    // 2. Add or update shapes in target
    for (const shape of targetState) {
      const current = currentMap.get(shape.id);
      if (!current || JSON.stringify(current) !== JSON.stringify(shape)) {
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId,
          })
        );
      }
    }
  }

  // Image Exporters
  private getBoundingBox() {
    if (this.existingShapes.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    this.existingShapes.forEach(shape => {
      if (shape.type === "rect") {
        minX = Math.min(minX, shape.x);
        minY = Math.min(minY, shape.y);
        maxX = Math.max(maxX, shape.x + shape.width);
        maxY = Math.max(maxY, shape.y + shape.height);
      } else if (shape.type === "circle") {
        minX = Math.min(minX, shape.centerX - shape.radius);
        minY = Math.min(minY, shape.centerY - shape.radius);
        maxX = Math.max(maxX, shape.centerX + shape.radius);
        maxY = Math.max(maxY, shape.centerY + shape.radius);
      } else if (shape.type === "pencil" || shape.type === "arrow") {
        minX = Math.min(minX, shape.startX, shape.endX);
        minY = Math.min(minY, shape.startY, shape.endY);
        maxX = Math.max(maxX, shape.startX, shape.endX);
        maxY = Math.max(maxY, shape.startY, shape.endY);
      } else if (shape.type === "rhombus") {
        minX = Math.min(minX, shape.centerX - shape.width / 2);
        minY = Math.min(minY, shape.centerY - shape.height / 2);
        maxX = Math.max(maxX, shape.centerX + shape.width / 2);
        maxY = Math.max(maxY, shape.centerY + shape.height / 2);
      } else if (shape.type === "text") {
        const width = shape.text.length * (shape.fontSize / 2);
        minX = Math.min(minX, shape.x);
        minY = Math.min(minY, shape.y - shape.fontSize);
        maxX = Math.max(maxX, shape.x + width);
        maxY = Math.max(maxY, shape.y);
      }
    });

    const padding = 20;
    return {
      x: minX - padding,
      y: minY - padding,
      width: (maxX - minX) + padding * 2,
      height: (maxY - minY) + padding * 2
    };
  }

  exportToPNG() {
    const dataUrl = this.canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `opendraw-room-${this.roomId}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }

  async exportToClipboard() {
    const bbox = this.getBoundingBox();
    if (!bbox) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = bbox.width;
    tempCanvas.height = bbox.height;
    const tempCtx = tempCanvas.getContext("2d")!;

    // Draw background
    tempCtx.fillStyle = "#0c0a09";
    tempCtx.fillRect(0, 0, bbox.width, bbox.height);

    // Set transform to offset by bounding box
    tempCtx.translate(-bbox.x, -bbox.y);

    // Reuse drawing logic (simplified for temp context)
    this.existingShapes.forEach((shape) => {
      tempCtx.strokeStyle = shape.color || "#ffffff";
      if (shape.type !== "text") {
        tempCtx.lineWidth = shape.strokeWidth || 1.5;
        if (shape.isDashed) tempCtx.setLineDash([6, 6]);
        else tempCtx.setLineDash([]);
      }

      if (shape.type === "rect") {
        tempCtx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        tempCtx.beginPath();
        tempCtx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
        tempCtx.stroke();
      } else if (shape.type === "pencil") {
        tempCtx.beginPath();
        tempCtx.moveTo(shape.startX, shape.startY);
        tempCtx.lineTo(shape.endX, shape.endY);
        tempCtx.stroke();
      } else if (shape.type === "rhombus") {
        tempCtx.beginPath();
        tempCtx.moveTo(shape.centerX, shape.centerY - shape.height / 2);
        tempCtx.lineTo(shape.centerX + shape.width / 2, shape.centerY);
        tempCtx.lineTo(shape.centerX, shape.centerY + shape.height / 2);
        tempCtx.lineTo(shape.centerX - shape.width / 2, shape.centerY);
        tempCtx.closePath();
        tempCtx.stroke();
      } else if (shape.type === "arrow") {
        tempCtx.beginPath();
        tempCtx.moveTo(shape.startX, shape.startY);
        tempCtx.lineTo(shape.endX, shape.endY);
        tempCtx.stroke();
        const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
        const arrowLength = 12 + (shape.strokeWidth || 1.5) * 1.5;
        tempCtx.beginPath();
        tempCtx.moveTo(shape.endX, shape.endY);
        tempCtx.lineTo(shape.endX - arrowLength * Math.cos(angle - Math.PI / 6), shape.endY - arrowLength * Math.sin(angle - Math.PI / 6));
        tempCtx.lineTo(shape.endX - arrowLength * Math.cos(angle + Math.PI / 6), shape.endY - arrowLength * Math.sin(angle + Math.PI / 6));
        tempCtx.closePath();
        tempCtx.fillStyle = tempCtx.strokeStyle;
        tempCtx.fill();
      } else if (shape.type === "text") {
        tempCtx.font = `${shape.fontSize}px sans-serif`;
        tempCtx.fillStyle = shape.color || "#ffffff";
        tempCtx.fillText(shape.text, shape.x, shape.y);
      }
    });

    try {
      tempCanvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
        }
      });
    } catch (err) {
      console.error("Failed to copy canvas image:", err);
    }
  }

  exportToSVG() {
    const bbox = this.getBoundingBox();
    if (!bbox) return;

    let svgContent = `<svg width="${bbox.width}" height="${bbox.height}" viewBox="${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}" xmlns="http://www.w3.org/2000/svg">`;
    svgContent += `<rect x="${bbox.x}" y="${bbox.y}" width="${bbox.width}" height="${bbox.height}" fill="#0c0a09" />`;

    this.existingShapes.forEach(shape => {
      const color = shape.color || "#ffffff";
      const strokeWidth = shape.type !== "text" ? (shape.strokeWidth || 1.5) : 0;
      const dash = shape.type !== "text" && shape.isDashed ? 'stroke-dasharray="6,6"' : "";

      if (shape.type === "rect") {
        svgContent += `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" ${dash} />`;
      } else if (shape.type === "circle") {
        svgContent += `<circle cx="${shape.centerX}" cy="${shape.centerY}" r="${Math.abs(shape.radius)}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" ${dash} />`;
      } else if (shape.type === "pencil") {
        svgContent += `<line x1="${shape.startX}" y1="${shape.startY}" x2="${shape.endX}" y2="${shape.endY}" stroke="${color}" stroke-width="${strokeWidth}" ${dash} />`;
      } else if (shape.type === "rhombus") {
        const points = `${shape.centerX},${shape.centerY - shape.height / 2} ${shape.centerX + shape.width / 2},${shape.centerY} ${shape.centerX},${shape.centerY + shape.height / 2} ${shape.centerX - shape.width / 2},${shape.centerY}`;
        svgContent += `<polygon points="${points}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" ${dash} />`;
      } else if (shape.type === "arrow") {
        svgContent += `<line x1="${shape.startX}" y1="${shape.startY}" x2="${shape.endX}" y2="${shape.endY}" stroke="${color}" stroke-width="${strokeWidth}" ${dash} />`;
        const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
        const arrowLength = 12 + strokeWidth * 1.5;
        const p1x = shape.endX - arrowLength * Math.cos(angle - Math.PI / 6);
        const p1y = shape.endY - arrowLength * Math.sin(angle - Math.PI / 6);
        const p2x = shape.endX - arrowLength * Math.cos(angle + Math.PI / 6);
        const p2y = shape.endY - arrowLength * Math.sin(angle + Math.PI / 6);
        svgContent += `<polygon points="${shape.endX},${shape.endY} ${p1x},${p1y} ${p2x},${p2y}" fill="${color}" />`;
      } else if (shape.type === "text") {
        svgContent += `<text x="${shape.x}" y="${shape.y}" fill="${color}" font-family="sans-serif" font-size="${shape.fontSize}">${shape.text}</text>`;
      }
    });

    svgContent += "</svg>";
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `opendraw-room-${this.roomId}-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
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
    if (this.laserTimeout) {
      cancelAnimationFrame(this.laserTimeout);
    }
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
    // Clear selection when changing tools
    this.selectedShape = null;
    this.render();
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId.toString());
    this.existingShapes = this.existingShapes.map((shape) => {
      if (!shape.id) {
        return { ...shape, id: `${Date.now()}-${Math.random()}` };
      }
      return shape;
    });
    this.render();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        if (!parsedShape.shape.id) {
          parsedShape.shape.id = `${Date.now()}-${Math.random()}`;
        }
        
        // Update shape if it already exists, otherwise append
        const existingIdx = this.existingShapes.findIndex(
          (s) => s.id === parsedShape.shape.id
        );
        if (existingIdx !== -1) {
          this.existingShapes[existingIdx] = parsedShape.shape;
        } else {
          this.existingShapes.push(parsedShape.shape);
        }
        this.render();
      } else if (message.type === "delete_shape") {
        const { shapeId } = message;
        this.existingShapes = this.existingShapes.filter(
          (s) => s.id !== shapeId
        );
        this.render();
      }
    };
  }

  drawAllShapes() {
    // Fill deep canvas background
    this.ctx.fillStyle = "#0c0a09"; // Slate black background
    this.ctx.fillRect(
      -this.viewportTransform.x / this.viewportTransform.scale,
      -this.viewportTransform.y / this.viewportTransform.scale,
      this.canvas.width / this.viewportTransform.scale,
      this.canvas.height / this.viewportTransform.scale
    );

    // Render static grid lines for canvas feel
    const scale = this.viewportTransform.scale;
    const gridSpacing = 30;
    const startX = Math.floor(-this.viewportTransform.x / scale / gridSpacing) * gridSpacing;
    const endX = startX + this.canvas.width / scale + gridSpacing;
    const startY = Math.floor(-this.viewportTransform.y / scale / gridSpacing) * gridSpacing;
    const endY = startY + this.canvas.height / scale + gridSpacing;

    this.ctx.beginPath();
    this.ctx.strokeStyle = "rgba(255,255,255,0.015)";
    this.ctx.lineWidth = 1;
    for (let x = startX; x <= endX; x += gridSpacing) {
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += gridSpacing) {
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
    }
    this.ctx.stroke();

    // Render persistent shapes
    this.existingShapes.forEach((shape) => {
      this.ctx.strokeStyle = shape.color || "#ffffff";
      
      if (shape.type !== "text") {
        this.ctx.lineWidth = shape.strokeWidth || 1.5;
        if (shape.isDashed) {
          this.ctx.setLineDash([6, 6]);
        } else {
          this.ctx.setLineDash([]);
        }
      } else {
        this.ctx.setLineDash([]);
      }

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
      } else if (shape.type === "arrow") {
        // Draw the main line
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
        this.ctx.closePath();

        // Draw arrow head at endX, endY
        const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
        const arrowLength = 12 + (shape.strokeWidth || 1.5) * 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(shape.endX, shape.endY);
        this.ctx.lineTo(
          shape.endX - arrowLength * Math.cos(angle - Math.PI / 6),
          shape.endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
          shape.endX - arrowLength * Math.cos(angle + Math.PI / 6),
          shape.endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fillStyle = this.ctx.strokeStyle;
        this.ctx.fill();
      } else if (shape.type === "text") {
        this.ctx.font = `${shape.fontSize}px sans-serif`;
        this.ctx.fillStyle = shape.color || "#ffffff";
        this.ctx.fillText(shape.text, shape.x, shape.y);
      }

      // Draw bounding box if shape is selected
      if (this.selectedTool === "select" && this.selectedShape && this.selectedShape.id === shape.id) {
        this.ctx.save();
        this.ctx.strokeStyle = "#38bdf8"; // Light Blue highlight
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([4, 4]);

        if (shape.type === "rect") {
          this.ctx.strokeRect(shape.x - 4, shape.y - 4, shape.width + 8, shape.height + 8);
        } else if (shape.type === "circle") {
          this.ctx.beginPath();
          this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius) + 4, 0, Math.PI * 2);
          this.ctx.stroke();
        } else if (shape.type === "rhombus") {
          this.ctx.strokeRect(
            shape.centerX - shape.width / 2 - 4,
            shape.centerY - shape.height / 2 - 4,
            shape.width + 8,
            shape.height + 8
          );
        } else if (shape.type === "pencil" || shape.type === "arrow") {
          this.ctx.strokeRect(
            Math.min(shape.startX, shape.endX) - 4,
            Math.min(shape.startY, shape.endY) - 4,
            Math.abs(shape.endX - shape.startX) + 8,
            Math.abs(shape.endY - shape.startY) + 8
          );
        } else if (shape.type === "text") {
          const width = shape.text.length * (shape.fontSize / 2);
          this.ctx.strokeRect(shape.x - 4, shape.y - shape.fontSize - 2, width + 8, shape.fontSize + 8);
        }
        this.ctx.restore();
      }
    });

    this.ctx.setLineDash([]);

    // Draw temporary laser points with a fading trail
    if (this.laserPoints.length > 1) {
      this.ctx.save();
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      for (let i = 1; i < this.laserPoints.length; i++) {
        const p1 = this.laserPoints[i - 1];
        const p2 = this.laserPoints[i];
        const age = Date.now() - p2.time;
        const opacity = Math.max(0, 1 - age / 1200);
        this.ctx.strokeStyle = `rgba(244, 63, 94, ${opacity})`; // Rose-500
        this.ctx.lineWidth = 4 * opacity;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
      }
      this.ctx.restore();
    }
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

  private deleteShapeAtCoordinates(coords: { x: number; y: number }) {
    let shapeToDelete: Shape | null = null;
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const shape = this.existingShapes[i];
      if (isPointInShape(coords, shape)) {
        shapeToDelete = shape;
        break;
      }
    }

    if (shapeToDelete) {
      this.saveHistory();
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
      return true;
    }
    return false;
  }

  // Laser Fade animation loops
  private startLaserFadeLoop() {
    const loop = () => {
      const now = Date.now();
      this.laserPoints = this.laserPoints.filter((pt) => now - pt.time < 1200);
      this.render();
      if (this.laserPoints.length > 0 || this.isLaserDrawing) {
        this.laserTimeout = requestAnimationFrame(loop);
      } else {
        this.laserTimeout = null;
      }
    };
    this.laserTimeout = requestAnimationFrame(loop);
  }

  // Snap Helper
  private getSnappedPoint(point: { x: number; y: number }, ignoreShapeId?: string) {
    let closestPoint = { ...point };
    let minDistance = 15; // Snapping threshold

    for (const shape of this.existingShapes) {
      if (shape.id === ignoreShapeId) continue;

      if (shape.type === "rect") {
        // Snap to edges of rectangle
        const edges = [
          { x: shape.x + shape.width / 2, y: shape.y }, // Top Center
          { x: shape.x + shape.width / 2, y: shape.y + shape.height }, // Bottom Center
          { x: shape.x, y: shape.y + shape.height / 2 }, // Left Center
          { x: shape.x + shape.width, y: shape.y + shape.height / 2 }, // Right Center
        ];
        edges.forEach(edge => {
          const d = Math.sqrt((point.x - edge.x) ** 2 + (point.y - edge.y) ** 2);
          if (d < minDistance) {
            minDistance = d;
            closestPoint = edge;
          }
        });
      } else if (shape.type === "circle") {
        const dx = point.x - shape.centerX;
        const dy = point.y - shape.centerY;
        const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
        if (distanceToCenter > 0) {
          const d = Math.abs(distanceToCenter - shape.radius);
          if (d < minDistance) {
            minDistance = d;
            closestPoint = {
              x: shape.centerX + (dx / distanceToCenter) * shape.radius,
              y: shape.centerY + (dy / distanceToCenter) * shape.radius
            };
          }
        }
      } else if (shape.type === "rhombus") {
        const edges = [
          { x: shape.centerX, y: shape.centerY - shape.height / 2 }, // Top
          { x: shape.centerX, y: shape.centerY + shape.height / 2 }, // Bottom
          { x: shape.centerX - shape.width / 2, y: shape.centerY }, // Left
          { x: shape.centerX + shape.width / 2, y: shape.centerY }, // Right
        ];
        edges.forEach(edge => {
          const d = Math.sqrt((point.x - edge.x) ** 2 + (point.y - edge.y) ** 2);
          if (d < minDistance) {
            minDistance = d;
            closestPoint = edge;
          }
        });
      }
    }
    return closestPoint;
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;

    if (this.selectedTool === "erase") {
      const coords = this.getCanvasCoordinates(e);
      this.deleteShapeAtCoordinates(coords);
      return;
    }

    if (this.selectedTool === "laser") {
      const coords = this.getCanvasCoordinates(e);
      this.isLaserDrawing = true;
      this.laserPoints.push({ ...coords, time: Date.now() });
      if (!this.laserTimeout) {
        this.startLaserFadeLoop();
      }
      return;
    }

    if (this.selectedTool === "select") {
      const coords = this.getCanvasCoordinates(e);
      let foundShape: Shape | null = null;
      for (let i = this.existingShapes.length - 1; i >= 0; i--) {
        if (isPointInShape(coords, this.existingShapes[i])) {
          foundShape = this.existingShapes[i];
          break;
        }
      }

      if (foundShape) {
        this.selectedShape = foundShape;
        this.dragStartCoords = coords;
        this.isDragging = true;
        this.saveHistory(); // Save action snapshot before drag
      } else {
        this.selectedShape = null;
      }
      this.render();
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
      
      // Arrow snap on start
      if (this.selectedTool === "arrow") {
        const snapped = this.getSnappedPoint(coords);
        this.startX = snapped.x;
        this.startY = snapped.y;
      } else {
        this.startX = coords.x;
        this.startY = coords.y;
      }
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (!this.clicked) return;
    this.clicked = false;

    if (this.selectedTool === "hand" || this.selectedTool === "erase") {
      return;
    }

    if (this.selectedTool === "laser") {
      this.isLaserDrawing = false;
      return;
    }

    if (this.selectedTool === "select") {
      if (this.isDragging && this.selectedShape) {
        this.isDragging = false;
        const shape = this.selectedShape;
        
        // Sync drag coordinates change
        this.socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId,
          })
        );
      }
      return;
    }

    const coords = this.getCanvasCoordinates(e);
    let endX = coords.x;
    let endY = coords.y;

    // Arrow snap on end
    if (this.selectedTool === "arrow") {
      const snapped = this.getSnappedPoint({ x: endX, y: endY });
      endX = snapped.x;
      endY = snapped.y;
    }

    // Snapping feature on Shift key
    if (e.shiftKey) {
      const dx = endX - this.startX;
      const dy = endY - this.startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        endY = this.startY; // Snap horizontal
      } else {
        endX = this.startX; // Snap vertical
      }
    }

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
        color: this.strokeColor,
        strokeWidth: this.strokeWidth,
        isDashed: this.isDashed,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.sqrt(
        (endX - this.startX) * (endX - this.startX) +
          (endY - this.startY) * (endY - this.startY)
      );
      shape = {
        id: shapeId,
        type: "circle",
        radius: radius,
        centerX: this.startX,
        centerY: this.startY,
        color: this.strokeColor,
        strokeWidth: this.strokeWidth,
        isDashed: this.isDashed,
      };
    } else if (selectedTool === "pencil") {
      shape = {
        id: shapeId,
        type: "pencil",
        startX: this.startX,
        startY: this.startY,
        endX: endX,
        endY: endY,
        color: this.strokeColor,
        strokeWidth: this.strokeWidth,
        isDashed: this.isDashed,
      };
    } else if (selectedTool === "rhombus") {
      shape = {
        id: shapeId,
        type: "rhombus",
        centerX: (this.startX + endX) / 2,
        centerY: (this.startY + endY) / 2,
        width: Math.abs(width),
        height: Math.abs(height),
        color: this.strokeColor,
        strokeWidth: this.strokeWidth,
        isDashed: this.isDashed,
      };
    } else if (selectedTool === "arrow") {
      shape = {
        id: shapeId,
        type: "arrow",
        startX: this.startX,
        startY: this.startY,
        endX: endX,
        endY: endY,
        color: this.strokeColor,
        strokeWidth: this.strokeWidth,
        isDashed: this.isDashed,
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
          color: this.strokeColor,
        };
      }
    }

    if (!shape) {
      return;
    }

    this.saveHistory();
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

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    if (this.selectedTool === "hand") {
      this.updatePanning(e);
      this.render();
      return;
    }

    if (this.selectedTool === "erase") {
      const coords = this.getCanvasCoordinates(e);
      this.deleteShapeAtCoordinates(coords);
      return;
    }

    if (this.selectedTool === "laser") {
      const coords = this.getCanvasCoordinates(e);
      this.laserPoints.push({ ...coords, time: Date.now() });
      return;
    }

    if (this.selectedTool === "select") {
      if (this.isDragging && this.selectedShape) {
        const coords = this.getCanvasCoordinates(e);
        const dx = coords.x - this.dragStartCoords.x;
        const dy = coords.y - this.dragStartCoords.y;
        this.dragStartCoords = coords;

        const shape = this.selectedShape;
        if (shape.type === "rect") {
          shape.x += dx;
          shape.y += dy;
        } else if (shape.type === "circle") {
          shape.centerX += dx;
          shape.centerY += dy;
        } else if (shape.type === "rhombus") {
          shape.centerX += dx;
          shape.centerY += dy;
        } else if (shape.type === "text") {
          shape.x += dx;
          shape.y += dy;
        } else if (shape.type === "pencil" || shape.type === "arrow") {
          shape.startX += dx;
          shape.startY += dy;
          shape.endX += dx;
          shape.endY += dy;
        }
        this.render();
      }
      return;
    }

    const coords = this.getCanvasCoordinates(e);
    let currentX = coords.x;
    let currentY = coords.y;

    // Arrow snap on preview
    if (this.selectedTool === "arrow") {
      const snapped = this.getSnappedPoint({ x: currentX, y: currentY });
      currentX = snapped.x;
      currentY = snapped.y;
    }

    if (e.shiftKey) {
      const dx = currentX - this.startX;
      const dy = currentY - this.startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        currentY = this.startY;
      } else {
        currentX = this.startX;
      }
    }

    const width = currentX - this.startX;
    const height = currentY - this.startY;

    this.render();

    // Use current styling parameter settings for drawing preview
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.strokeWidth;
    if (this.isDashed) {
      this.ctx.setLineDash([6, 6]);
    } else {
      this.ctx.setLineDash([5, 5]); // default preview dashes
    }

    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(
        Math.min(this.startX, currentX),
        Math.min(this.startY, currentY),
        Math.abs(width),
        Math.abs(height)
      );
    } else if (this.selectedTool === "circle") {
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
      const centerX = (this.startX + currentX) / 2;
      const centerY = (this.startY + currentY) / 2;
      const halfWidth = Math.abs(width) / 2;
      const halfHeight = Math.abs(height) / 2;

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - halfHeight);
      this.ctx.lineTo(centerX + halfWidth, centerY);
      this.ctx.lineTo(centerX, centerY + halfHeight);
      this.ctx.lineTo(centerX, centerY + halfHeight);
      this.ctx.lineTo(centerX - halfWidth, centerY);
      this.ctx.closePath();
      this.ctx.stroke();
    } else if (this.selectedTool === "arrow") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
      this.ctx.closePath();

      const angle = Math.atan2(currentY - this.startY, currentX - this.startX);
      const arrowLength = 12 + this.strokeWidth * 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(currentX, currentY);
      this.ctx.lineTo(
        currentX - arrowLength * Math.cos(angle - Math.PI / 6),
        currentY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.lineTo(
        currentX - arrowLength * Math.cos(angle + Math.PI / 6),
        currentY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.closePath();
      this.ctx.fillStyle = this.ctx.strokeStyle;
      this.ctx.fill();
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
