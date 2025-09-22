import { useEffect, useRef, useState } from "react";
// import { initDraw } from "@/draw";
import { Circle, Pencil, Square } from "lucide-react";
import { IconButton } from "@repo/ui";
import clsx from "clsx";
import { Game } from "@/draw/Game";
import useScreenSize from "@/hooks/useScreensize";

export type Tool = "circle" | "rect" | "pencil";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game | null>(null)
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");
  const { height, width } = useScreenSize()
  useEffect(() => {
    game?.setTool(selectedTool)
  }, [selectedTool, game])

  useEffect(() => {
    if (canvasRef.current) {
      const tool = new Game(canvasRef.current, roomId, socket)
      setGame(tool)

      return () => {
        tool.destroy()
      }
    }
  }, []);

  return (
    <div>
      <canvas
        id="canvas"
        ref={canvasRef}
        width={width}
        height={height}
        className="relative"
      />
      <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}

const TopBar = ({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: React.Dispatch<React.SetStateAction<Tool>>;
}) => {
  return (
    <div className="absolute top-0 left-10">
      <IconButton
        handleClick={() => setSelectedTool("circle")}
        className={clsx(
          "m-1 cursor-pointer"
        )}
      >
        <Circle color={selectedTool === "circle" ? "green" : "white"}/>
      </IconButton>
      <IconButton
        handleClick={() => setSelectedTool("rect")}
        className={clsx(
          "m-1 cursor-pointer"
        )}
      >
        <Square color={selectedTool === "rect" ? "green" : "white"}/>
      </IconButton>
      <IconButton
        handleClick={() => setSelectedTool("pencil")}
        className={clsx(
          "m-1 cursor-pointer"
        )}
      >
        <Pencil color={selectedTool === "pencil" ? "green" : "white"}/>
      </IconButton>
    </div>
  );
};
