export interface Layer {
  id: number;
  name: string;
  pixels: string[][];
  visible: boolean;
  opacity: number;
}

export type Tool =
  | "brush"
  | "eraser"
  | "fill"
  | "square"
  | "circle"
  | "line"
  | "pan";

export interface ToolState {
  color: string;
  tool: Tool;
  brushSize: number;
}

export type ToolAction =
  | { type: "SET_COLOR"; color: string }
  | { type: "SET_TOOL"; tool: Tool }
  | { type: "SET_BRUSH_SIZE"; size: number };

export interface HistoryState {
  past: CanvasState[];
  future: CanvasState[];
}

export type HistoryAction =
  | { type: "ADD_TO_HISTORY"; state: CanvasState }
  | { type: "UNDO" }
  | { type: "REDO" };

export interface CanvasState {
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  zoom: number;
  layers: Layer[];
  activeLayerId: number | null;
  pan: { x: number; y: number };
}

export type CanvasAction =
  | { type: "SET_CANVAS_SIZE"; width: number; height: number }
  | { type: "SET_GRID_SIZE"; size: number }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_LAYERS"; layers: Layer[] }
  | { type: "SET_ACTIVE_LAYER"; id: number | null }
  | { type: "SET_PAN"; x: number; y: number }
  | { type: "SET_CANVAS_STATE"; state: CanvasState };
