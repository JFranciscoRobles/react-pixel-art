import { atom } from "jotai";
import { atomWithReducer } from "jotai/utils";
import { CanvasState, HistoryState, Layer, ToolState } from "./types";
import { toolReducer } from "./reducer/tool-reducer";
import { canvasReducer } from "./reducer/canvas-reducer";
import { historyReducer } from "./reducer/history-reducer";

const createPixelGrid = (gridSize: number) => {
  return Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill("transparent"));
};

const initialToolState: ToolState = {
  color: "#000000",
  tool: "brush",
  brushSize: 1,
};

const initialHistoryState: HistoryState = {
  past: [],
  future: [],
};

const initialCanvasState: CanvasState = {
  canvasWidth: 512,
  canvasHeight: 512,
  gridSize: 16,
  zoom: 1,
  layers: [],
  activeLayerId: 1,
  pan: { x: 0, y: 0 },
};

const initialLayer: Layer = {
  id: 1,
  name: "Layer 1",
  pixels: createPixelGrid(initialCanvasState.gridSize),
  visible: true,
  opacity: 1,
};

initialCanvasState.layers.push(initialLayer);
initialCanvasState.activeLayerId = initialLayer.id;

export const toolAtom = atomWithReducer(initialToolState, toolReducer);
export const historyAtom = atomWithReducer(initialHistoryState, historyReducer);
export const canvasAtom = atomWithReducer(initialCanvasState, canvasReducer);
export const isDrawingAtom = atom(false);
export const shapeStartAtom = atom<{ x: number; y: number } | null>(null);
export const previewPixelsAtom = atom<{ x: number; y: number }[]>([]);

export const pixelArtStateAtom = atom((get) => ({
  ...get(toolAtom),
  ...get(canvasAtom),
  history: get(historyAtom),
  isDrawing: get(isDrawingAtom),
  shapeStart: get(shapeStartAtom),
  previewPixels: get(previewPixelsAtom),
}));
