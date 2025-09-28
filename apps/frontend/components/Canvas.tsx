import { useEffect, useRef, useState } from "react";
import { Circle, Hand, Pencil, Square, Trash2, Type, Diamond } from "lucide-react"; // Import new icons
import { IconButton } from "@repo/ui";
import clsx from "clsx";
import { Game } from "@/draw/Game";
import useScreenSize from "@/hooks/useScreensize";

// 1. Extend the Tool type
export type Tool = "circle" | "rect" | "pencil" | "hand" | "erase" | "text" | "rhombus";

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
      // Ensure game knows current canvas pixel dimensions immediately
      tool.resize(width, height)

      return () => {
        tool.destroy()
      }
    }
  }, []);

  // Ensure canvas and game resize when screen size changes
  useEffect(() => {
    if (!canvasRef.current) return;
    // set canvas element size and notify game
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    if (game) {
      game.resize(width, height);
    }
  }, [width, height, game]);

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
      <IconButton
        handleClick={() => setSelectedTool("rhombus")}
        className={clsx("m-1 cursor-pointer")}
      >
        <Diamond color={selectedTool === "rhombus" ? "#34D399" : "white"} />
      </IconButton>
      <IconButton
        handleClick={() => setSelectedTool("text")}
        className={clsx("m-1 cursor-pointer")}
      >
        <Type color={selectedTool === "text" ? "#34D399" : "white"} />
      </IconButton>

      <IconButton
        handleClick={() => setSelectedTool("hand")}
        className={clsx("m-1 cursor-pointer")}
      >
        <Hand color={selectedTool === "hand" ? "#34D399" : "white"} />
      </IconButton>
      <IconButton
        handleClick={() => setSelectedTool("erase")}
        className={clsx("m-1 cursor-pointer")}
      >
        <Trash2 color={selectedTool === "erase" ? "#F87171" : "white"} />
      </IconButton>
    </div>
  );
};
