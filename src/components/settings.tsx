import { useAtom } from "jotai";
import { canvasAtom } from "../libs/atoms";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export function Settings() {
  const [canvasState, dispatchCanvas] = useAtom(canvasAtom);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="canvasWidth">Ancho del canvas</Label>
        <Input
          id="canvasWidth"
          type="number"
          value={canvasState.canvasWidth}
          onChange={(e) =>
            dispatchCanvas({
              type: "SET_CANVAS_SIZE",
              width: Number(e.target.value),
              height: canvasState.canvasHeight,
            })
          }
          min="1"
        />
      </div>
      <div>
        <Label htmlFor="canvasHeight">Alto del canvas</Label>
        <Input
          id="canvasHeight"
          type="number"
          value={canvasState.canvasHeight}
          onChange={(e) =>
            dispatchCanvas({
              type: "SET_CANVAS_SIZE",
              width: canvasState.canvasWidth,
              height: Number(e.target.value),
            })
          }
          min="1"
        />
      </div>
      <div>
        <Label htmlFor="gridSize">Celdas por lado</Label>
        <Input
          id="gridSize"
          type="number"
          value={canvasState.gridSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            if (newSize >= 1 && newSize <= 64) {
              // Nuevo rango de validación
              dispatchCanvas({
                type: "SET_GRID_SIZE",
                size: newSize,
              });
            } else {
              alert("El tamaño debe estar entre 1 y 64.");
            }
          }}
          min="1"
          max="64"
        />
      </div>
    </div>
  );
}
