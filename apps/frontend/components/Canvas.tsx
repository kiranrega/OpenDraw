"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Circle, Hand, Pencil, Square, Trash2, Type, Diamond, 
  MousePointer, ArrowUpRight, Sparkles, Undo2, Redo2, 
  Download, Copy, Check 
} from "lucide-react";
import { IconButton } from "@repo/ui";
import clsx from "clsx";
import { Game } from "@/draw/Game";
import useScreenSize from "@/hooks/useScreensize";

export type Tool = "circle" | "rect" | "pencil" | "hand" | "erase" | "text" | "rhombus" | "arrow" | "select" | "laser";

export default function Canvas({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");
  const { height, width } = useScreenSize();

  // Styling properties state
  const [selectedColor, setSelectedColor] = useState<string>("#ffffff"); // default white
  const [selectedWidth, setSelectedWidth] = useState<number>(1.5);
  const [selectedDashed, setSelectedDashed] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sync tool changes
  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  // Sync styling parameter updates
  useEffect(() => {
    if (game) {
      game.setStrokeColor(selectedColor);
    }
  }, [selectedColor, game]);

  useEffect(() => {
    if (game) {
      game.setStrokeWidth(selectedWidth);
    }
  }, [selectedWidth, game]);

  useEffect(() => {
    if (game) {
      game.setDashed(selectedDashed);
    }
  }, [selectedDashed, game]);

  // Listen to tool hotkeys & undo/redo keyboard actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key shortcuts if user is typing in prompts, inputs, or textareas
      const activeEl = document.activeElement as HTMLElement;
      if (
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.isContentEditable
      ) {
        return;
      }

      // Check undo/redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        game?.undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        game?.redo();
        return;
      }

      switch (e.key.toLowerCase()) {
        case "v":
          setSelectedTool("select");
          break;
        case "h":
          setSelectedTool("hand");
          break;
        case "r":
          setSelectedTool("rect");
          break;
        case "o":
          setSelectedTool("circle");
          break;
        case "d":
          setSelectedTool("rhombus");
          break;
        case "a":
          setSelectedTool("arrow");
          break;
        case "p":
          setSelectedTool("pencil");
          break;
        case "t":
          setSelectedTool("text");
          break;
        case "l":
          setSelectedTool("laser");
          break;
        case "e":
          setSelectedTool("erase");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [game]);

  useEffect(() => {
    if (canvasRef.current) {
      const tool = new Game(canvasRef.current, roomId, socket);
      setGame(tool);

      // Initialize game config
      tool.setStrokeColor(selectedColor);
      tool.setStrokeWidth(selectedWidth);
      tool.setDashed(selectedDashed);
      tool.resize(width, height);

      return () => {
        tool.destroy();
      };
    }
  }, [roomId, socket, width, height]);

  // Handle canvas resize
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    if (game) {
      game.resize(width, height);
    }
  }, [width, height, game]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0c0a09] select-none text-white font-sans">
      <canvas
        id="canvas"
        ref={canvasRef}
        width={width}
        height={height}
        className="block cursor-crosshair"
      />

      {/* Top Floating Toolbar (Tools Selector) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-md border border-stone-800 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 z-30">
        {[
          { tool: "select", icon: MousePointer, label: "Select (V)" },
          { tool: "hand", icon: Hand, label: "Pan Canvas (H)" },
          { tool: "rect", icon: Square, label: "Rectangle (R)" },
          { tool: "circle", icon: Circle, label: "Circle (O)" },
          { tool: "rhombus", icon: Diamond, label: "Diamond (D)" },
          { tool: "arrow", icon: ArrowUpRight, label: "Arrow (A)" },
          { tool: "pencil", icon: Pencil, label: "Pencil Draw (P)" },
          { tool: "text", icon: Type, label: "Add Text (T)" },
          { tool: "laser", icon: Sparkles, label: "Laser Pointer (L)" },
          { tool: "erase", icon: Trash2, label: "Erase Shape (E)" }
        ].map(({ tool, icon: Icon, label }) => {
          const isActive = selectedTool === tool;
          return (
            <div key={tool} className="relative group">
              <IconButton
                handleClick={() => setSelectedTool(tool as Tool)}
                className={clsx(
                  "p-2 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center",
                  isActive 
                    ? "bg-white text-gray-950 scale-105 shadow-md" 
                    : "text-stone-400 hover:text-white hover:bg-stone-800"
                )}
              >
                <Icon className="w-5 h-5" />
              </IconButton>
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[10px] font-medium text-stone-200 bg-stone-950 border border-stone-800 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating Left Sidebar (Styling Controls) */}
      {selectedTool !== "hand" && selectedTool !== "erase" && selectedTool !== "laser" && (
        <div className="absolute top-20 left-4 bg-stone-900/95 backdrop-blur-md border border-stone-800 p-4 rounded-2xl shadow-xl flex flex-col gap-4 w-52 z-30 animate-fade-in">
          {/* Color Palette Picker */}
          <div>
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">Stroke Color</span>
            <div className="grid grid-cols-6 gap-2">
              {[
                { hex: "#ffffff", name: "White" },
                { hex: "#38bdf8", name: "Sky Blue" },
                { hex: "#4ade80", name: "Green" },
                { hex: "#fb7185", name: "Rose" },
                { hex: "#fbbf24", name: "Amber" },
                { hex: "#c084fc", name: "Purple" }
              ].map(({ hex, name }) => (
                <button
                  key={hex}
                  onClick={() => setSelectedColor(hex)}
                  className={clsx(
                    "w-6 h-6 rounded-full border transition-all duration-150 relative cursor-pointer flex items-center justify-center",
                    selectedColor === hex 
                      ? "border-white scale-110 shadow-sm" 
                      : "border-stone-800 hover:scale-105"
                  )}
                  style={{ backgroundColor: hex }}
                  title={name}
                >
                  {selectedColor === hex && (
                    <span className={clsx("text-[9px] font-bold", hex === "#ffffff" ? "text-stone-950" : "text-white")}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stroke Width Config */}
          {selectedTool !== "text" && (
            <div>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">Stroke Width</span>
              <div className="flex bg-stone-950 p-0.5 rounded-xl border border-stone-850 gap-0.5">
                {[
                  { value: 1.5, label: "Thin" },
                  { value: 3.5, label: "Medium" },
                  { value: 5.5, label: "Bold" }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedWidth(value)}
                    className={clsx(
                      "flex-1 text-center py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer",
                      selectedWidth === value 
                        ? "bg-stone-850 text-white shadow-sm" 
                        : "text-stone-400 hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Line Dash Config */}
          {selectedTool !== "text" && (
            <div>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">Line Style</span>
              <div className="flex bg-stone-950 p-0.5 rounded-xl border border-stone-850 gap-0.5">
                <button
                  onClick={() => setSelectedDashed(false)}
                  className={clsx(
                    "flex-1 text-center py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer",
                    !selectedDashed 
                      ? "bg-stone-850 text-white shadow-sm" 
                      : "text-stone-400 hover:text-white"
                  )}
                >
                  Solid
                </button>
                <button
                  onClick={() => setSelectedDashed(true)}
                  className={clsx(
                    "flex-1 text-center py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer",
                    selectedDashed 
                      ? "bg-stone-850 text-white shadow-sm" 
                      : "text-stone-400 hover:text-white"
                  )}
                >
                  Dashed
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Floating Control Bar (Action buttons) */}
      <div className="absolute bottom-4 left-4 bg-stone-900/90 backdrop-blur-md border border-stone-800 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 z-30">
        {/* Undo */}
        <div className="relative group">
          <IconButton
            handleClick={() => game?.undo()}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-850 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          >
            <Undo2 className="w-4.5 h-4.5" />
          </IconButton>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[9px] font-medium text-stone-200 bg-stone-950 border border-stone-800 rounded-lg shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Undo (Ctrl+Z)
          </span>
        </div>

        {/* Redo */}
        <div className="relative group">
          <IconButton
            handleClick={() => game?.redo()}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-850 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          >
            <Redo2 className="w-4.5 h-4.5" />
          </IconButton>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[9px] font-medium text-stone-200 bg-stone-950 border border-stone-800 rounded-lg shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Redo (Ctrl+Y)
          </span>
        </div>

        <div className="w-[1px] h-5 bg-stone-800 mx-1" />

        {/* Download Image */}
        <div className="relative group flex items-center">
          <IconButton
            handleClick={() => game?.exportToPNG()}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-850 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          >
            <Download className="w-4.5 h-4.5" />
          </IconButton>
          <button 
            onClick={() => game?.exportToSVG()}
            className="ml-1 px-1.5 py-1 text-[9px] font-bold text-stone-500 hover:text-stone-200 hover:bg-stone-850 rounded-md transition-all uppercase tracking-tighter"
          >
            SVG
          </button>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[9px] font-medium text-stone-200 bg-stone-950 border border-stone-800 rounded-lg shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Export PNG / SVG
          </span>
        </div>

        {/* Copy Image to Clipboard */}
        <div className="relative group">
          <IconButton
            handleClick={async () => {
              await game?.exportToClipboard();
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            }}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-850 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          >
            {isCopied ? (
              <Check className="w-4.5 h-4.5 text-emerald-400" />
            ) : (
              <Copy className="w-4.5 h-4.5" />
            )}
          </IconButton>
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[9px] font-medium text-stone-200 bg-stone-950 border border-stone-800 rounded-lg shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isCopied ? "Copied!" : "Copy to Clipboard"}
          </span>
        </div>
      </div>

      {/* Snap Guides Hotkey Tip (Shift key) */}
      <div className="absolute bottom-4 right-4 bg-stone-950/60 border border-stone-850/40 text-[10px] text-stone-500 font-mono px-2.5 py-1.5 rounded-lg pointer-events-none tracking-wide select-none">
        Hold <span className="bg-stone-850 text-stone-300 px-1.5 py-0.5 rounded border border-stone-800">Shift</span> to snap lines & arrows
      </div>
    </div>
  );
}
