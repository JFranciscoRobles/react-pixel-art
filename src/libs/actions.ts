import { Dispatch, RefObject } from "react";
import { Action, AppState } from "./atoms";

let animationFrameId: number | null = null;

const getCoordinates = (
  event:
    | React.MouseEvent<HTMLCanvasElement>
    | React.TouchEvent<HTMLCanvasElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  canvasState: AppState
) => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: -1, y: -1 };

  const rect = canvas.getBoundingClientRect();
  let clientX = 0;
  let clientY = 0;

  if ("touches" in event) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = event.clientX;
    clientY = event.clientY;
  }

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.floor(((clientX - rect.left) * scaleX) / canvasState.cellSize);
  const y = Math.floor(((clientY - rect.top) * scaleY) / canvasState.cellSize);

  return {
    x: Math.max(0, Math.min(x, canvasState.gridSize - 1)),
    y: Math.max(0, Math.min(y, canvasState.gridSize - 1)),
  };
};

export const startDrawing = (
  event:
    | React.MouseEvent<HTMLCanvasElement>
    | React.TouchEvent<HTMLCanvasElement>,
  dispatch: Dispatch<Action>,
  canvasState: AppState,
  canvasRef: RefObject<HTMLCanvasElement>
) => {
  dispatch({ type: "SET_DRAWING", payload: true });
  const { x, y } = getCoordinates(event, canvasRef, canvasState);
  dispatch({ type: "SET_START_POS", payload: { x, y } });

  if (
    canvasState.tool !== "circle" &&
    canvasState.tool !== "square" &&
    canvasState.tool !== "line"
  ) {
    dispatch({ type: "SET_CELL", x, y });
  }
};

export const updatePreviewOnMouseMove = (
  event:
    | React.MouseEvent<HTMLCanvasElement>
    | React.TouchEvent<HTMLCanvasElement>,
  dispatch: Dispatch<Action>,
  canvasState: AppState,
  canvasRef: RefObject<HTMLCanvasElement>
) => {
  const { x, y } = getCoordinates(event, canvasRef, canvasState);

  const renderPreview = () => {
    let preview = [];

    if (canvasState.startPos) {
      switch (canvasState.tool) {
        case "circle": {
          const radius = Math.max(
            Math.abs(x - canvasState.startPos.x),
            Math.abs(y - canvasState.startPos.y)
          );

          for (let angle = 0; angle < 360; angle++) {
            const radians = (angle * Math.PI) / 180;
            const nx = Math.round(
              canvasState.startPos.x + radius * Math.cos(radians)
            );
            const ny = Math.round(
              canvasState.startPos.y + radius * Math.sin(radians)
            );

            if (
              nx >= 0 &&
              ny >= 0 &&
              nx < canvasState.gridSize &&
              ny < canvasState.gridSize
            ) {
              preview.push({ x: nx, y: ny });
            }
          }
          break;
        }
        case "square": {
          const width = Math.abs(x - canvasState.startPos.x);
          const height = Math.abs(y - canvasState.startPos.y);
          for (let i = 0; i <= width; i++) {
            for (let j = 0; j <= height; j++) {
              const nx =
                canvasState.startPos.x +
                i * Math.sign(x - canvasState.startPos.x);
              const ny =
                canvasState.startPos.y +
                j * Math.sign(y - canvasState.startPos.y);
              if (
                nx >= 0 &&
                ny >= 0 &&
                nx < canvasState.gridSize &&
                ny < canvasState.gridSize
              ) {
                if (i === 0 || i === width || j === 0 || j === height) {
                  preview.push({ x: nx, y: ny });
                }
              }
            }
          }
          break;
        }
        case "line": {
          let dx = Math.abs(x - canvasState.startPos.x);
          let sx = canvasState.startPos.x < x ? 1 : -1;
          let dy = -Math.abs(y - canvasState.startPos.y);
          let sy = canvasState.startPos.y < y ? 1 : -1;
          let err = dx + dy;

          let cx = canvasState.startPos.x;
          let cy = canvasState.startPos.y;
          while (true) {
            preview.push({ x: cx, y: cy });
            if (cx === x && cy === y) break;
            const e2 = 2 * err;
            if (e2 >= dy) {
              err += dy;
              cx += sx;
            }
            if (e2 <= dx) {
              err += dx;
              cy += sy;
            }
          }
          break;
        }
        default:
          break;
      }
    } else {
      switch (canvasState.tool) {
        case "draw":
        case "erase":
          for (let i = 0; i < canvasState.brushSize; i++) {
            for (let j = 0; j < canvasState.brushSize; j++) {
              const nx = x + i;
              const ny = y + j;
              if (
                nx >= 0 &&
                ny >= 0 &&
                nx < canvasState.gridSize &&
                ny < canvasState.gridSize
              ) {
                preview.push({ x: nx, y: ny });
              }
            }
          }
          break;
        case "fill":
          preview.push({ x, y });
          break;
      }
    }

    dispatch({ type: "SET_PREVIEW_CELLS", payload: preview });

    if (
      canvasState.isDrawing &&
      (canvasState.tool === "draw" || canvasState.tool === "erase")
    ) {
      dispatch({ type: "SET_CELL", x, y });
    }
  };

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(renderPreview);
};

export const finishDrawing = (
  dispatch: Dispatch<Action>,
  canvasState: AppState,
  dispatchHistory: any
) => {
  if (
    canvasState.startPos &&
    (canvasState.tool === "circle" ||
      canvasState.tool === "square" ||
      canvasState.tool === "line")
  ) {
    dispatch({
      type: "SET_SHAPE",
      shape: canvasState.tool,
      startX: canvasState.startPos.x,
      startY: canvasState.startPos.y,
      endX: canvasState.previewCells[canvasState.previewCells.length - 1]?.x,
      endY: canvasState.previewCells[canvasState.previewCells.length - 1]?.y,
    });
  }

  // Finalizar el dibujo
  dispatch({ type: "SET_DRAWING", payload: false });
  dispatch({ type: "SET_START_POS", payload: null });

  dispatchHistory("ADD_HISTORY", canvasState);
};

export const resetDrawingState = (dispatch: Dispatch<Action>) => {
  dispatch({ type: "SET_DRAWING", payload: false });
  dispatch({ type: "SET_PREVIEW_CELLS", payload: [] });
};
