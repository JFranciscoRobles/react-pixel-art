import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { gridReducer } from "./gridReducer";

export type Layer = {
  id: number;
  name: string;
  grid: (string | null)[][];
  visible: boolean;
  opacity: number;
};

export interface AppState {
  gridSize: number;
  cellSize: number;
  layers: Layer[];
  activeLayerId: number;
  color: string;
  tool: "draw" | "erase" | "fill" | "circle" | "square" | "line";
  isDrawing: boolean;
  brushSize: number;
  previewCells: { x: number; y: number }[];
  startPos: { x: number; y: number } | null;
}

export const MAX_HISTORY_SIZE = 5;

export const initialState: AppState = {
  gridSize: 8,
  cellSize: 64,
  layers: [
    {
      id: 1,
      name: "Layout 1",
      grid: Array(8)
        .fill(null)
        .map(() => Array(8).fill(null)),
      visible: true,
      opacity: 1,
    },
  ],
  activeLayerId: 1,
  color: "#000000",
  tool: "draw",
  isDrawing: false,
  brushSize: 1,
  previewCells: [] as { x: number; y: number }[],
  startPos: null as { x: number; y: number } | null,
};

export type Action =
  | { type: "SET_COLOR"; payload: string }
  | {
      type: "SET_TOOL";
      payload: "draw" | "erase" | "fill" | "circle" | "square" | "line";
    }
  | { type: "SET_CELL"; x: number; y: number }
  | { type: "RESET_GRID" }
  | { type: "SET_DRAWING"; payload: boolean }
  | { type: "SET_BRUSH_SIZE"; payload: number }
  | { type: "SET_PREVIEW_CELLS"; payload: { x: number; y: number }[] }
  | { type: "SET_START_POS"; payload: { x: number; y: number } | null }
  | { type: "ADD_LAYER" }
  | { type: "REMOVE_LAYER"; layerId: number }
  | { type: "SET_ACTIVE_LAYER"; layerId: number }
  | { type: "TOGGLE_LAYER_VISIBILITY"; layerId: number }
  | { type: "RENAME_LAYER"; layerId: number; name: string }
  | { type: "SET_GRID_SIZE"; size: number }
  | { type: "SET_CELL_SIZE"; size: number }
  | { type: "SET_LAYER_OPACITY"; layerId: number; opacity: number }
  | {
      type: "SET_SHAPE";
      shape: "circle" | "square" | "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export const undoRedoAtom = atom({
  history: [] as AppState[],
  future: [] as AppState[],
});

export const undoRedoActionsAtom = atom(
  (get) => get(undoRedoAtom),
  (get, set, action: "UNDO" | "REDO" | "ADD_HISTORY", newState?: AppState) => {
    const { history, future } = get(undoRedoAtom);
    const currentState = get(storedGridAtom);

    const updateHistory = (
      newHistory: AppState[],
      newFuture: AppState[] = []
    ) => {
      set(undoRedoAtom, { history: newHistory, future: newFuture });
    };

    switch (action) {
      case "UNDO": {
        if (history.length > 1) {
          const previousState = history[history.length - 2];
          const newHistory = history.slice(0, -1);
          const newFuture = [currentState, ...future];

          set(storedGridAtom, previousState);
          updateHistory(newHistory, newFuture);
        }
        break;
      }
      case "REDO": {
        if (future.length > 0) {
          const nextState = future[0];
          const newFuture = future.slice(1);
          const newHistory = [...history, currentState];

          set(storedGridAtom, nextState);
          updateHistory(newHistory, newFuture);
        }
        break;
      }
      case "ADD_HISTORY": {
        if (newState && newState !== currentState) {
          // Si el historial está vacío, agrega el estado inicial
          const isFirstAction = history.length === 0;

          const newHistory = isFirstAction
            ? [currentState] // Guarda el estado inicial si es la primera acción
            : [...history, currentState].slice(-MAX_HISTORY_SIZE); // Guarda el historial con límite

          updateHistory(newHistory);
        }
        break;
      }
    }
  }
);

export const storedGridAtom = atomWithStorage("gridState", initialState);

export const gridAtom = atom(
  (get) => get(storedGridAtom),
  (get, set, action: Action) => {
    const newState = gridReducer(get(storedGridAtom), action);
    set(storedGridAtom, newState);
  }
);

export const drawGridAtom = atom((get) => {
  const { layers, gridSize, cellSize } = get(gridAtom);

  return (
    ctx: CanvasRenderingContext2D,
    previewCells: { x: number; y: number }[],
    previewColor: string
  ) => {
    ctx.clearRect(0, 0, gridSize * cellSize, gridSize * cellSize);

    layers.forEach((layer) => {
      if (layer.visible) {
        ctx.globalAlpha = layer.opacity;
        layer.grid.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              ctx.fillStyle = cell;
              ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
          });
        });
      }
    });

    ctx.globalAlpha = 1;

    if (previewCells.length > 0) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = previewColor;

      previewCells.forEach(({ x, y }) => {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      });

      ctx.globalAlpha = 1;
    }
  };
});
