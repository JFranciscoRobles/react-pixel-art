import { useAtom } from "jotai";
import { Button } from "../components/ui/button";
import {
  Brush,
  Eraser,
  PaintBucket,
  Square,
  Circle,
  Minus,
  Move,
} from "lucide-react";
import { toolAtom } from "../libs/atoms";

export function Toolbar() {
  const [toolState, dispatchTool] = useAtom(toolAtom);

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        onClick={() => dispatchTool({ type: "SET_TOOL", tool: "brush" })}
        variant={toolState.tool === "brush" ? "default" : "outline"}
      >
        <Brush className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => dispatchTool({ type: "SET_TOOL", tool: "eraser" })}
        variant={toolState.tool === "eraser" ? "default" : "outline"}
      >
        <Eraser className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => dispatchTool({ type: "SET_TOOL", tool: "fill" })}
        variant={toolState.tool === "fill" ? "default" : "outline"}
      >
        <PaintBucket className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => dispatchTool({ type: "SET_TOOL", tool: "square" })}
        variant={toolState.tool === "square" ? "default" : "outline"}
      >
        <Square className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => dispatchTool({ type: "SET_TOOL", tool: "circle" })}
        variant={toolState.tool === "circle" ? "default" : "outline"}
      >
        <Circle className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => dispatchTool({ type: "SET_TOOL", tool: "line" })}
        variant={toolState.tool === "line" ? "default" : "outline"}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => dispatchTool({ type: "SET_TOOL", tool: "pan" })}
        variant={toolState.tool === "pan" ? "default" : "outline"}
      >
        <Move className="w-4 h-4" />
      </Button>
    </div>
  );
}
