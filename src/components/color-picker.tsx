import React from "react";
import { useAtom } from "jotai";
import { toolAtom } from "../libs/atoms";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export function ColorPicker() {
  const [toolState, dispatchTool] = useAtom(toolAtom);

  return (
    <div className="mb-4">
      <Label htmlFor="color">Color</Label>
      <Input
        id="color"
        type="color"
        value={toolState.color}
        onChange={(e) =>
          dispatchTool({ type: "SET_COLOR", color: e.target.value })
        }
      />
    </div>
  );
}
