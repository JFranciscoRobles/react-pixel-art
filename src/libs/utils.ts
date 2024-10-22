import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

export const createEmptyGrid = (size: number) =>
  Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));

export const resizeGrid = (
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

export const floodFill = (
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

export const drawCircle = (
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

export const drawSquare = (
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

export const drawLine = (
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
