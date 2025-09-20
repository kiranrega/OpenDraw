import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";

export default function Canvas({ roomId, socket }: { roomId: number, socket: WebSocket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      initDraw(canvasRef.current, roomId, socket);
    }
  }, []);

  return (
    <div>
      <canvas id="canvas" ref={canvasRef} width={800} height={800} />
    </div>
  );
}
