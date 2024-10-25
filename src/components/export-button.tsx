import { Download } from "lucide-react";
import { useAtom } from "jotai";
import { canvasAtom } from "../libs/atoms";
import { Button } from "./ui/button";

export function ExportButton() {
  const [canvasState] = useAtom(canvasAtom);

  const handleExport = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasState.canvasWidth;
    canvas.height = canvasState.canvasHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      canvasState.layers.forEach((layer) => {
        if (layer.visible) {
          layer.pixels.forEach((row, y) => {
            row.forEach((color, x) => {
              if (color !== "transparent") {
                ctx.fillStyle = color;
                ctx.globalAlpha = layer.opacity;
                ctx.fillRect(
                  x * (canvasState.canvasWidth / canvasState.gridSize),
                  y * (canvasState.canvasHeight / canvasState.gridSize),
                  canvasState.canvasWidth / canvasState.gridSize,
                  canvasState.canvasHeight / canvasState.gridSize
                );
              }
            });
          });
        }
      });

      const link = document.createElement("a");
      link.download = "pixel-art.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <Button onClick={handleExport} className="w-full mt-4">
      <Download className="w-4 h-4 mr-2" />
      Exportar
    </Button>
  );
}
