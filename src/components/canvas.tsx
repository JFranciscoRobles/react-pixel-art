import React, { useCallback, useState } from "react";
import { useAtom } from "jotai";
import {
  canvasAtom,
  isDrawingAtom,
  previewPixelsAtom,
  shapeStartAtom,
  toolAtom,
} from "../libs/atoms";
import { cn } from "../libs/utils";

interface CanvasProps {
  containerRef: React.RefObject<HTMLDivElement>;
  canvaRef: React.RefObject<HTMLDivElement>;
}

export function Canvas({ containerRef, canvaRef }: CanvasProps) {
  const [canvasState, dispatchCanvas] = useAtom(canvasAtom);

  const [toolState] = useAtom(toolAtom);
  const [isDrawing, setIsDrawing] = useAtom(isDrawingAtom);
  const [shapeStart, setShapeStart] = useAtom(shapeStartAtom);
  const [previewPixels, setPreviewPixels] = useAtom(previewPixelsAtom);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const cellSizeX = canvasState.canvasWidth / canvasState.gridSize;
  const cellSizeY = canvasState.canvasHeight / canvasState.gridSize;

  const drawPixel = useCallback(
    (x: number, y: number) => {
      if (canvasState.activeLayerId === null) return;

      const newLayers = canvasState.layers.map((layer) => {
        if (layer.id === canvasState.activeLayerId) {
          const newPixels = [...layer.pixels];
          for (
            let i = -Math.floor(toolState.brushSize / 2);
            i < Math.ceil(toolState.brushSize / 2);
            i++
          ) {
            for (
              let j = -Math.floor(toolState.brushSize / 2);
              j < Math.ceil(toolState.brushSize / 2);
              j++
            ) {
              if (
                x + i >= 0 &&
                x + i < canvasState.gridSize &&
                y + j >= 0 &&
                y + j < canvasState.gridSize
              ) {
                newPixels[y + j][x + i] =
                  toolState.tool === "eraser" ? "transparent" : toolState.color;
              }
            }
          }
          return { ...layer, pixels: newPixels };
        }
        return layer;
      });
      dispatchCanvas({ type: "SET_LAYERS", layers: newLayers });
    },
    [canvasState, toolState, dispatchCanvas]
  );

  const fillPixels = useCallback(
    (startX: number, startY: number) => {
      if (canvasState.activeLayerId === null) return;
      const targetColor = canvasState.layers.find(
        (layer) => layer.id === canvasState.activeLayerId
      )?.pixels[startY][startX];
      if (targetColor === toolState.color) return;

      const newLayers = canvasState.layers.map((layer) => {
        if (layer.id === canvasState.activeLayerId) {
          const newPixels = [...layer.pixels];
          const stack = [{ x: startX, y: startY }];

          while (stack.length > 0) {
            const { x, y } = stack.pop()!;
            if (
              x < 0 ||
              x >= canvasState.gridSize ||
              y < 0 ||
              y >= canvasState.gridSize
            )
              continue;
            if (newPixels[y][x] !== targetColor) continue;

            newPixels[y][x] = toolState.color;
            stack.push(
              { x: x + 1, y },
              { x: x - 1, y },
              { x, y: y + 1 },
              { x, y: y - 1 }
            );
          }

          return { ...layer, pixels: newPixels };
        }
        return layer;
      });

      dispatchCanvas({ type: "SET_LAYERS", layers: newLayers });
    },
    [canvasState, toolState, dispatchCanvas]
  );

  const drawShape = useCallback(
    (endX: number, endY: number) => {
      if (canvasState.activeLayerId === null || !shapeStart) return;
      const startX = shapeStart.x;
      const startY = shapeStart.y;

      const newLayers = canvasState.layers.map((layer) => {
        if (layer.id === canvasState.activeLayerId) {
          const newPixels = [...layer.pixels];
          if (toolState.tool === "line") {
            const dx = Math.abs(endX - startX);
            const dy = Math.abs(endY - startY);
            const sx = startX < endX ? 1 : -1;
            const sy = startY < endY ? 1 : -1;
            let err = dx - dy;
            let x = startX;
            let y = startY;

            while (true) {
              for (
                let i = -Math.floor(toolState.brushSize / 2);
                i < Math.ceil(toolState.brushSize / 2);
                i++
              ) {
                for (
                  let j = -Math.floor(toolState.brushSize / 2);
                  j < Math.ceil(toolState.brushSize / 2);
                  j++
                ) {
                  if (
                    x + i >= 0 &&
                    x + i < canvasState.gridSize &&
                    y + j >= 0 &&
                    y + j < canvasState.gridSize
                  ) {
                    newPixels[y + j][x + i] = toolState.color;
                  }
                }
              }
              if (x === endX && y === endY) break;
              const e2 = 2 * err;
              if (e2 > -dy) {
                err -= dy;
                x += sx;
              }
              if (e2 < dx) {
                err += dx;
                y += sy;
              }
            }
          } else {
            for (
              let y = Math.min(startY, endY);
              y <= Math.max(startY, endY);
              y++
            ) {
              for (
                let x = Math.min(startX, endX);
                x <= Math.max(startX, endX);
                x++
              ) {
                if (toolState.tool === "square") {
                  newPixels[y][x] = toolState.color;
                } else if (toolState.tool === "circle") {
                  const centerX = (startX + endX) / 2;
                  const centerY = (startY + endY) / 2;
                  const radiusX = Math.abs(endX - startX) / 2;
                  const radiusY = Math.abs(endY - startY) / 2;
                  if (
                    Math.pow((x - centerX) / radiusX, 2) +
                      Math.pow((y - centerY) / radiusY, 2) <=
                    1
                  ) {
                    newPixels[y][x] = toolState.color;
                  }
                }
              }
            }
          }
          return { ...layer, pixels: newPixels };
        }
        return layer;
      });

      dispatchCanvas({ type: "SET_LAYERS", layers: newLayers });
    },
    [canvasState, toolState, shapeStart, dispatchCanvas]
  );

  const handleMouseDown = useCallback(
    (x: number, y: number) => {
      if (toolState.tool === "pan") {
        setIsPanning(true);
        setLastMousePosition({ x, y });
      } else if (["square", "circle", "line"].includes(toolState.tool)) {
        setShapeStart({ x, y });
      } else {
        setIsDrawing(true);

        if (toolState.tool === "fill") {
          fillPixels(x, y);
        } else {
          drawPixel(x, y);
        }
      }
    },
    [toolState.tool, setShapeStart, setIsDrawing, fillPixels, drawPixel]
  );

  const handleMouseMove = useCallback(
    (x: number, y: number) => {
      if (toolState.tool === "pan" && isPanning && lastMousePosition) {
        const dx = x - lastMousePosition.x;
        const dy = y - lastMousePosition.y;
        dispatchCanvas({
          type: "SET_PAN",
          x: canvasState.pan.x + dx / canvasState.zoom,
          y: canvasState.pan.y + dy / canvasState.zoom,
        });

        setLastMousePosition({ x, y });
      } else if (isDrawing && ["brush", "eraser"].includes(toolState.tool)) {
        drawPixel(x, y);
      } else if (
        ["square", "circle", "line"].includes(toolState.tool) &&
        shapeStart
      ) {
        const previewPixels = [];

        const startX = Math.min(shapeStart.x, x);
        const startY = Math.min(shapeStart.y, y);
        const endX = Math.max(shapeStart.x, x);
        const endY = Math.max(shapeStart.y, y);

        if (toolState.tool === "line") {
          const dx = Math.abs(x - shapeStart.x);
          const dy = Math.abs(y - shapeStart.y);
          const sx = shapeStart.x < x ? 1 : -1;
          const sy = shapeStart.y < y ? 1 : -1;
          let err = dx - dy;
          let currentX = shapeStart.x;
          let currentY = shapeStart.y;

          while (true) {
            for (
              let i = -Math.floor(toolState.brushSize / 2);
              i < Math.ceil(toolState.brushSize / 2);
              i++
            ) {
              for (
                let j = -Math.floor(toolState.brushSize / 2);
                j < Math.ceil(toolState.brushSize / 2);
                j++
              ) {
                if (
                  currentX + i >= 0 &&
                  currentX + i < canvasState.gridSize &&
                  currentY + j >= 0 &&
                  currentY + j < canvasState.gridSize
                ) {
                  previewPixels.push({ x: currentX + i, y: currentY + j });
                }
              }
            }
            if (currentX === x && currentY === y) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
              err -= dy;
              currentX += sx;
            }
            if (e2 < dx) {
              err += dx;
              currentY += sy;
            }
          }
        } else {
          for (let py = startY; py <= endY; py++) {
            for (let px = startX; px <= endX; px++) {
              if (
                toolState.tool === "square" ||
                (toolState.tool === "circle" &&
                  Math.pow(
                    (px - (startX + endX) / 2) / ((endX - startX) / 2),
                    2
                  ) +
                    Math.pow(
                      (py - (startY + endY) / 2) / ((endY - startY) / 2),
                      2
                    ) <=
                    1)
              ) {
                for (
                  let i = -Math.floor(toolState.brushSize / 2);
                  i < Math.ceil(toolState.brushSize / 2);
                  i++
                ) {
                  for (
                    let j = -Math.floor(toolState.brushSize / 2);
                    j < Math.ceil(toolState.brushSize / 2);
                    j++
                  ) {
                    if (
                      px + i >= 0 &&
                      px + i < canvasState.gridSize &&
                      py + j >= 0 &&
                      py + j < canvasState.gridSize
                    ) {
                      previewPixels.push({ x: px + i, y: py + j });
                    }
                  }
                }
              }
            }
          }
        }

        setPreviewPixels(previewPixels);
      } else {
        const previewPixels = [];
        for (
          let i = -Math.floor(toolState.brushSize / 2);
          i < Math.ceil(toolState.brushSize / 2);
          i++
        ) {
          for (
            let j = -Math.floor(toolState.brushSize / 2);
            j < Math.ceil(toolState.brushSize / 2);
            j++
          ) {
            if (
              x + i >= 0 &&
              x + i < canvasState.gridSize &&
              y + j >= 0 &&
              y + j < canvasState.gridSize
            ) {
              previewPixels.push({ x: x + i, y: y + j });
            }
          }
        }
        setPreviewPixels(previewPixels);
      }
    },
    [
      toolState.tool,
      toolState.brushSize,
      isPanning,
      lastMousePosition,
      isDrawing,
      shapeStart,
      dispatchCanvas,
      canvasState.pan.x,
      canvasState.pan.y,
      canvasState.zoom,
      canvasState.gridSize,
      drawPixel,
      setPreviewPixels,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (toolState.tool === "pan") {
      setIsPanning(false);
      setLastMousePosition(null);
    } else if (isDrawing) {
      setIsDrawing(false);
    } else if (
      ["square", "circle", "line"].includes(toolState.tool) &&
      shapeStart
    ) {
      drawShape(
        previewPixels[previewPixels.length - 1].x,
        previewPixels[previewPixels.length - 1].y
      );
    }
    setPreviewPixels([]);
    setShapeStart(null);
  }, [
    toolState.tool,
    isDrawing,
    shapeStart,
    previewPixels,
    drawShape,
    setIsDrawing,
    setPreviewPixels,
    setShapeStart,
  ]);

  const cursorClass = (() => {
    switch (toolState.tool) {
      case "brush":
        return "cursor-brush";
      case "eraser":
        return "cursor-eraser";
      case "fill":
        return "cursor-fill";
      case "square":
      case "circle":
      case "line":
        return "cursor-square"; // Todos usan crosshair
      case "pan":
        return "cursor-pan";
      default:
        return "cursor-default"; // Cursor por defecto si no se encuentra una herramienta
    }
  })();

  return (
    <div
      ref={containerRef}
      className={cn(`p-4 overflow-auto border bg-gradient`, cursorClass)}
      style={{
        width: "100%",
        height: "calc(100vh - 8rem)",
      }}
    >
      {/* Contenedor para el PAN (desplazamiento) */}

      {/* Contenedor para el ZOOM */}
      <div
        className="bg-white/80 transform-gpu"
        ref={canvaRef}
        style={{
          transform: `scale(${canvasState.zoom}) translate(${canvasState.pan.x}px, ${canvasState.pan.y}px)`,
          transformOrigin: "0 0",
          width: `${canvasState.canvasWidth}px`,
          height: `${canvasState.canvasHeight}px`,
        }}
        draggable={false}
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.floor(
            (e.clientX - rect.left) / (cellSizeX * canvasState.zoom)
          );
          const y = Math.floor(
            (e.clientY - rect.top) / (cellSizeY * canvasState.zoom)
          );
          handleMouseDown(x, y);
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = Math.floor(
            (e.clientX - rect.left) / (cellSizeX * canvasState.zoom)
          );
          const y = Math.floor(
            (e.clientY - rect.top) / (cellSizeY * canvasState.zoom)
          );
          handleMouseMove(x, y);
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          e.preventDefault(); // Prevenir scroll accidental
          const rect = e.currentTarget.getBoundingClientRect();
          const touch = e.touches[0];
          const x = Math.floor(
            (touch.clientX - rect.left) / (cellSizeX * canvasState.zoom)
          );
          const y = Math.floor(
            (touch.clientY - rect.top) / (cellSizeY * canvasState.zoom)
          );
          handleMouseDown(x, y);
        }}
        onTouchMove={(e) => {
          e.preventDefault(); // Prevenir desplazamiento
          const rect = e.currentTarget.getBoundingClientRect();
          const touch = e.touches[0];
          const x = Math.floor(
            (touch.clientX - rect.left) / (cellSizeX * canvasState.zoom)
          );
          const y = Math.floor(
            (touch.clientY - rect.top) / (cellSizeY * canvasState.zoom)
          );
          handleMouseMove(x, y);
        }}
        onTouchEnd={handleMouseUp}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${canvasState.gridSize}, ${cellSizeX}px)`,
            gridTemplateRows: `repeat(${canvasState.gridSize}, ${cellSizeY}px)`,
            width: `${canvasState.canvasWidth}px`,
            height: `${canvasState.canvasHeight}px`,
            position: "relative",
          }}
        >
          {canvasState.layers.map(
            (layer, layerIndex) =>
              layer.visible && (
                <div
                  key={layer.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    gridTemplateColumns: `repeat(${canvasState.gridSize}, ${cellSizeX}px)`,
                    gridTemplateRows: `repeat(${canvasState.gridSize}, ${cellSizeY}px)`,
                    zIndex: layerIndex,
                    opacity: layer.opacity,
                  }}
                >
                  {layer.pixels.map((row, y) =>
                    row.map((pixelColor, x) => (
                      <div
                        key={`${x}-${y}`}
                        style={{ backgroundColor: pixelColor }}
                        className="border-gray-400 border-[1.5px]"
                      />
                    ))
                  )}
                </div>
              )
          )}
          {previewPixels.map((pixel, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                top: pixel.y * cellSizeY,
                left: pixel.x * cellSizeX,
                width: `${cellSizeX}px`,
                height: `${cellSizeY}px`,
                backgroundColor:
                  toolState.tool === "eraser"
                    ? "rgba(255,255,255,0.5)"
                    : toolState.color,
                opacity: 0.5,
                zIndex: canvasState.layers.length,
                pointerEvents: "none",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
