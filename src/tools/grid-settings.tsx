import React from "react";
import { useAtom } from "jotai";
import { gridAtom } from "../libs/atoms";
import { Slider } from "../components/ui/slider";
import { Grid, LayoutGridIcon, Maximize } from "lucide-react";

export default function GridSettings() {
  const [state, dispatch] = useAtom(gridAtom);

  const handleGridSizeChange = (newSize: number[]) => {
    dispatch({ type: "SET_GRID_SIZE", size: newSize[0] });
  };

  const handleCellSizeChange = (newSize: number[]) => {
    dispatch({ type: "SET_CELL_SIZE", size: newSize[0] });
  };

  return (
    <div className="p-4 space-y-4 rounded-lg ">
      <h2 className="flex items-center mb-4 text-2xl font-bold">
        <LayoutGridIcon className="mr-2" />
        Grid Settings
      </h2>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="grid-size"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Grid className="w-4 h-4" />
            Grid Size
          </label>
          <span className="text-sm font-bold">{state.gridSize}</span>
        </div>
        <Slider
          id="grid-size"
          min={1}
          max={32}
          step={1}
          value={[state.gridSize]}
          onValueChange={handleGridSizeChange}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="cell-size"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Maximize className="w-4 h-4" />
            Cell Size
          </label>
          <span className="text-sm font-bold">{state.cellSize}px</span>
        </div>
        <Slider
          id="cell-size"
          min={1}
          max={128}
          step={1}
          value={[state.cellSize]}
          onValueChange={handleCellSizeChange}
          className="w-full"
        />
      </div>
    </div>
  );
}
