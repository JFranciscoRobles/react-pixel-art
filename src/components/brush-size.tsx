import React from "react";
import { useAtom } from "jotai";
import { toolAtom } from "../libs/atoms";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";

export function BrushSize() {
  const [toolState, dispatchTool] = useAtom(toolAtom);

  return (
    <div className="mb-4">
      <Label htmlFor="brushSize">Tamaño del pincel</Label>
      <div className="flex items-center space-x-2">
        <Slider
          id="brushSize"
          min={1}
          max={10}
          step={1}
          value={[toolState.brushSize]}
          onValueChange={(value) =>
            dispatchTool({ type: "SET_BRUSH_SIZE", size: value[0] })
          }
          className="flex-grow"
        />
        <Input
          type="number"
          value={toolState.brushSize}
          onChange={(e) =>
            dispatchTool({
              type: "SET_BRUSH_SIZE",
              size: Number(e.target.value),
            })
          }
          className="w-16"
          min={1}
          max={10}
        />
      </div>
    </div>
  );
}
