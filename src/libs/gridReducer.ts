import { Action, AppState } from "./atoms";
import {
  createEmptyGrid,
  drawCircle,
  drawLine,
  drawSquare,
  floodFill,
  resizeGrid,
} from "./utils";

export const gridReducer = (state: AppState, action: Action) => {
  switch (action.type) {
    case "SET_COLOR":
      return { ...state, color: action.payload };

    case "SET_TOOL":
      return { ...state, tool: action.payload };

    case "SET_CELL": {
      const { x, y } = action;
      const activeLayer = state.layers.find(
        (layer) => layer.id === state.activeLayerId
      );
      if (!activeLayer) return state;

      const newGrid = activeLayer.grid.map((row) => [...row]);

      switch (state.tool) {
        case "draw":
          for (let i = 0; i < state.brushSize; i++) {
            for (let j = 0; j < state.brushSize; j++) {
              const nx = x + i;
              const ny = y + j;
              if (nx < state.gridSize && ny < state.gridSize) {
                newGrid[ny][nx] = state.color;
              }
            }
          }
          break;

        case "erase":
          for (let i = 0; i < state.brushSize; i++) {
            for (let j = 0; j < state.brushSize; j++) {
              const nx = x + i;
              const ny = y + j;
              if (nx < state.gridSize && ny < state.gridSize) {
                newGrid[ny][nx] = null;
              }
            }
          }
          break;

        case "fill":
          return {
            ...state,
            layers: state.layers.map((layer) =>
              layer.id === state.activeLayerId
                ? { ...layer, grid: floodFill(newGrid, x, y, state.color) }
                : layer
            ),
          };

        case "circle":
          return {
            ...state,
            layers: state.layers.map((layer) =>
              layer.id === state.activeLayerId
                ? {
                    ...layer,
                    grid: drawCircle(
                      newGrid,
                      x,
                      y,
                      state.color,
                      state.brushSize
                    ),
                  }
                : layer
            ),
          };

        case "square":
          return {
            ...state,
            layers: state.layers.map((layer) =>
              layer.id === state.activeLayerId
                ? {
                    ...layer,
                    grid: drawSquare(
                      newGrid,
                      x,
                      y,
                      state.color,
                      state.brushSize
                    ),
                  }
                : layer
            ),
          };

        case "line":
          return {
            ...state,
            layers: state.layers.map((layer) =>
              layer.id === state.activeLayerId
                ? { ...layer, grid: drawLine(newGrid, x, y, state.color) }
                : layer
            ),
          };
      }

      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === state.activeLayerId ? { ...layer, grid: newGrid } : layer
        ),
      };
    }

    case "RESET_GRID":
      return {
        ...state,
        layers: state.layers.map((layer) => ({
          ...layer,
          grid: createEmptyGrid(state.gridSize),
        })),
      };

    case "SET_DRAWING":
      return { ...state, isDrawing: action.payload };

    case "SET_BRUSH_SIZE":
      return {
        ...state,
        brushSize: Math.max(1, Math.min(action.payload, state.gridSize)),
      };

    case "SET_PREVIEW_CELLS":
      return { ...state, previewCells: action.payload };

    case "SET_START_POS":
      return { ...state, startPos: action.payload };
    case "SET_SHAPE": {
      const { shape, startX, startY, endX, endY } = action;
      const activeLayer = state.layers.find(
        (layer) => layer.id === state.activeLayerId
      );
      if (!activeLayer) return state;

      const newGrid = activeLayer.grid.map((row) => [...row]);

      switch (shape) {
        case "circle": {
          const radius = Math.max(
            Math.abs(endX - startX),
            Math.abs(endY - startY)
          );
          for (let angle = 0; angle < 360; angle++) {
            const radians = (angle * Math.PI) / 180;
            const nx = Math.round(startX + radius * Math.cos(radians));
            const ny = Math.round(startY + radius * Math.sin(radians));
            if (
              nx >= 0 &&
              ny >= 0 &&
              nx < state.gridSize &&
              ny < state.gridSize
            ) {
              newGrid[ny][nx] = state.color;
            }
          }
          break;
        }
        case "square": {
          const width = Math.abs(endX - startX);
          const height = Math.abs(endY - startY);
          for (let i = 0; i <= width; i++) {
            for (let j = 0; j <= height; j++) {
              const x = startX + i * Math.sign(endX - startX);
              const y = startY + j * Math.sign(endY - startY);
              if (
                x >= 0 &&
                y >= 0 &&
                x < state.gridSize &&
                y < state.gridSize
              ) {
                if (i === 0 || i === width || j === 0 || j === height) {
                  newGrid[y][x] = state.color;
                }
              }
            }
          }
          break;
        }
        case "line": {
          let dx = Math.abs(endX - startX);
          let sx = startX < endX ? 1 : -1;
          let dy = -Math.abs(endY - startY);
          let sy = startY < endY ? 1 : -1;
          let err = dx + dy;
          let x = startX;
          let y = startY;
          while (true) {
            if (x >= 0 && y >= 0 && x < state.gridSize && y < state.gridSize) {
              newGrid[y][x] = state.color;
            }
            if (x === endX && y === endY) break;
            const e2 = 2 * err;
            if (e2 >= dy) {
              err += dy;
              x += sx;
            }
            if (e2 <= dx) {
              err += dx;
              y += sy;
            }
          }
          break;
        }
      }

      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === state.activeLayerId ? { ...layer, grid: newGrid } : layer
        ),
      };
    }

    case "ADD_LAYER":
      const newLayerId = Math.max(...state.layers.map((l) => l.id)) + 1;
      return {
        ...state,
        layers: [
          ...state.layers,
          {
            id: newLayerId,
            name: `Layout ${newLayerId}`,
            grid: createEmptyGrid(state.gridSize),
            visible: true,
            opacity: 1,
          },
        ],
        activeLayerId: newLayerId,
      };

    case "REMOVE_LAYER":
      if (state.layers.length === 1) return state;
      return {
        ...state,
        layers: state.layers.filter((layer) => layer.id !== action.layerId),
        activeLayerId:
          state.activeLayerId === action.layerId
            ? state.layers[0].id
            : state.activeLayerId,
      };

    case "SET_ACTIVE_LAYER":
      return { ...state, activeLayerId: action.layerId };

    case "TOGGLE_LAYER_VISIBILITY":
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === action.layerId
            ? { ...layer, visible: !layer.visible }
            : layer
        ),
      };

    case "RENAME_LAYER":
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === action.layerId ? { ...layer, name: action.name } : layer
        ),
      };

    case "SET_GRID_SIZE":
      const newGridSize = Math.max(1, Math.min(action.size, 32));
      return {
        ...state,
        gridSize: newGridSize,
        layers: state.layers.map((layer) => ({
          ...layer,
          grid: resizeGrid(layer.grid, newGridSize),
        })),
        brushSize: Math.min(state.brushSize, newGridSize),
      };

    case "SET_CELL_SIZE":
      return { ...state, cellSize: Math.max(1, Math.min(action.size, 128)) };

    case "SET_LAYER_OPACITY":
      return {
        ...state,
        layers: state.layers.map((layer) =>
          layer.id === action.layerId
            ? { ...layer, opacity: Math.max(0, Math.min(1, action.opacity)) }
            : layer
        ),
      };

    default:
      return state;
  }
};
