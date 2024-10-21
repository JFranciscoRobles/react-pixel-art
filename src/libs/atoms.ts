import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Layer = {
  id: number;
  name: string;
  grid: (string | null)[][];
  visible: boolean;
  opacity: number;
};

export const initialState = {
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

const createEmptyGrid = (size: number) =>
  Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

const resizeGrid = (
  grid: (string | null)[][],
  newSize: number
): (string | null)[][] => {
  return Array(newSize)
    .fill(null)
    .map((_, y) =>
      Array(newSize)
        .fill(null)
        .map((_, x) =>
          y < grid.length && x < grid[0].length ? grid[y][x] : null
        )
    );
};

const gridReducer = (state: typeof initialState, action: Action) => {
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
      if (state.layers.length === 1) return state; // No permitir eliminar la última capa
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
      const newGridSize = Math.max(1, Math.min(action.size, 32)); // Limitar entre 1 y 32
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
      return { ...state, cellSize: Math.max(1, Math.min(action.size, 128)) }; // Limitar entre 1 y 128

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

const floodFill = (
  grid: (string | null)[][],
  x: number,
  y: number,
  color: string
) => {
  const targetColor = grid[y][x];
  if (targetColor === color) return grid;

  const stack = [[x, y]];
  const newGrid = grid.map((row) => [...row]);
  const gridSize = newGrid.length;

  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    if (
      cx >= 0 &&
      cy >= 0 &&
      cx < gridSize &&
      cy < gridSize &&
      newGrid[cy][cx] === targetColor
    ) {
      newGrid[cy][cx] = color;
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
  }
  return newGrid;
};

const drawCircle = (
  grid: (string | null)[][],
  cx: number,
  cy: number,
  color: string,
  size: number
) => {
  const newGrid = grid.map((row) => [...row]);
  const gridSize = newGrid.length;
  const radius = size;

  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x * x + y * y <= radius * radius) {
        const nx = cx + x;
        const ny = cy + y;
        if (nx >= 0 && ny >= 0 && nx < gridSize && ny < gridSize) {
          newGrid[ny][nx] = color;
        }
      }
    }
  }
  return newGrid;
};

const drawSquare = (
  grid: (string | null)[][],
  x: number,
  y: number,
  color: string,
  size: number
) => {
  const newGrid = grid.map((row) => [...row]);
  const gridSize = newGrid.length;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const nx = x + i;
      const ny = y + j;

      if (nx < gridSize && ny < gridSize) {
        if (i === 0 || i === size - 1 || j === 0 || j === size - 1) {
          newGrid[ny][nx] = color;
        }
      }
    }
  }
  return newGrid;
};

const drawLine = (
  grid: (string | null)[][],
  x0: number,
  y0: number,
  color: string
) => {
  const newGrid = grid.map((row) => [...row]);
  const gridSize = newGrid.length;
  const x1 = gridSize - 1;
  const y1 = y0;

  let dx = Math.abs(x1 - x0);
  let sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  let sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    newGrid[y0][x0] = color;
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
  return newGrid;
};
export const storedGridAtom = atomWithStorage("gridState", initialState);

export const gridAtom = atom(
  (get) => get(storedGridAtom),
  (get, set, action) => {
    //@ts-ignore
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

    // Dibujar todas las capas visibles
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
