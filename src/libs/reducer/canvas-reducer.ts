import { CanvasAction, CanvasState } from "../types";

export const canvasReducer = (
  state: CanvasState,
  action: CanvasAction
): CanvasState => {
  switch (action.type) {
    case "SET_CANVAS_SIZE":
      return {
        ...state,
        canvasWidth: action.width,
        canvasHeight: action.height,
      };
    case "SET_GRID_SIZE":
      return {
        ...state,
        gridSize: action.size,
        layers: state.layers.map((layer) => {
          const newPixels = Array(action.size)
            .fill(null)
            .map(() => Array(action.size).fill("transparent"));

          for (let y = 0; y < Math.min(layer.pixels.length, action.size); y++) {
            for (
              let x = 0;
              x < Math.min(layer.pixels[y].length, action.size);
              x++
            ) {
              newPixels[y][x] = layer.pixels[y][x];
            }
          }

          return { ...layer, pixels: newPixels };
        }),
      };
    case "SET_ZOOM":
      return { ...state, zoom: action.zoom };
    case "SET_LAYERS":
      return { ...state, layers: action.layers };
    case "SET_ACTIVE_LAYER":
      return { ...state, activeLayerId: action.id };
    case "SET_PAN":
      return { ...state, pan: { x: action.x, y: action.y } };
    case "SET_CANVAS_STATE":
      return { ...action.state };
    default:
      return state;
  }
};
