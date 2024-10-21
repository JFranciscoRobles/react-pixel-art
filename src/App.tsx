import { useEffect, useRef } from "react";
import { drawGridAtom, gridAtom } from "./libs/atoms";
import { useAtomValue, useSetAtom } from "jotai";
import ColorPicker from "./tools/color-picker";
import { ToolSelector } from "./tools/tool-selector";
import BrushSizeSelector from "./tools/brush-size";
import ResetGrid from "./tools/reset-grid";
import {
  finishDrawing,
  resetDrawingState,
  startDrawing,
  updatePreviewOnMouseMove,
} from "./libs/actions";
import LayerManager from "./canva/layer-manager";
import GridSettings from "./tools/grid-settings";

function App() {
  const drawGrid = useAtomValue(drawGridAtom);
  const canvaState = useAtomValue(gridAtom);
  const dispatch = useSetAtom(gridAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) drawGrid(ctx, canvaState.previewCells, canvaState.color);
  }, [drawGrid, canvaState.previewCells, canvaState.color]);

  const handleStart = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    startDrawing(event, dispatch, canvaState, canvasRef);
  };

  const handleMove = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    updatePreviewOnMouseMove(event, dispatch, canvaState, canvasRef);
  };

  const handleEnd = () => {
    finishDrawing(dispatch, canvaState);
  };

  const handleLeave = () => {
    resetDrawingState(dispatch);
  };

  return (
    <div className="max-w-screen-xl p-4 mx-auto">
      <h1 className="text-3xl font-bold text-center sm:text-4xl">Pixel Art</h1>

      <div className="flex flex-col gap-8 my-12 lg:flex-row">
        {/* Sección izquierda */}
        <div className="flex flex-col w-full gap-6 p-4 rounded-xl bg-secondary lg:max-w-xs">
          <ToolSelector />
          <ColorPicker />
          <BrushSizeSelector />
          <GridSettings />
        </div>

        {/* Canvas */}
        <div className="flex items-center justify-center w-full">
          <canvas
            ref={canvasRef}
            width={canvaState.gridSize * canvaState.cellSize}
            height={canvaState.gridSize * canvaState.cellSize}
            style={{
              backgroundImage: `linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)`,
              backgroundSize: `${canvaState.cellSize}px ${canvaState.cellSize}px`,
            }}
            className="max-w-full border-2 touch-none"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleLeave}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </div>

        <div className="flex flex-col w-full gap-6 p-4 rounded-xl bg-secondary lg:max-w-xs">
          <LayerManager />
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <ResetGrid />
      </div>
    </div>
  );
}

export default App;
