import { useEffect, useRef } from "react";
import { drawGridAtom, gridAtom, undoRedoActionsAtom } from "./libs/atoms";
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
import UndoRedo from "./tools/undo-redo";

function App() {
  const drawGrid = useAtomValue(drawGridAtom);
  const canvaState = useAtomValue(gridAtom);
  const dispatch = useSetAtom(gridAtom);
  const dispatchHistory = useSetAtom(undoRedoActionsAtom);
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
    finishDrawing(dispatch, canvaState, dispatchHistory);
  };

  const handleLeave = () => {
    resetDrawingState(dispatch);
  };

  return (
    <div className="max-w-screen-xl p-4 mx-auto">
      <h1 className="text-3xl font-bold text-center sm:text-4xl">Pixel Art</h1>

      <div className="flex flex-col gap-8 my-12 lg:flex-row">
        <div className="flex flex-col w-full gap-6 p-4 rounded-xl bg-secondary lg:max-w-xs">
          <ToolSelector />
          <ColorPicker />
          <BrushSizeSelector />
          <GridSettings />
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex justify-end w-full max-w-3xl space-x-2">
            <UndoRedo />
          </div>
          <div className="relative w-full overflow-hidden">
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={canvaState.gridSize * canvaState.cellSize}
              height={canvaState.gridSize * canvaState.cellSize}
              style={{
                backgroundImage: `linear-gradient(0deg, #ccc 1px, transparent 1px), 
                        linear-gradient(90deg, #ccc 1px, transparent 1px)`,
                backgroundSize: `${canvaState.cellSize}px ${canvaState.cellSize}px`,
                backgroundPosition: "0 0",
              }}
              className="border-2 rounded-md"
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleLeave}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
          </div>
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
