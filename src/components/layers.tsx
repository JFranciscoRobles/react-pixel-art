import { useAtom } from "jotai";
import {
  Plus,
  Trash,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit2,
} from "lucide-react";
import { canvasAtom } from "../libs/atoms";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

export function Layers() {
  const [canvasState, dispatchCanvas] = useAtom(canvasAtom);

  const addLayer = () => {
    const newLayer = {
      id: Date.now(),
      name: `Layer ${canvasState.layers.length + 1}`,
      pixels: Array(canvasState.gridSize)
        .fill(null)
        .map(() => Array(canvasState.gridSize).fill("transparent")),
      visible: true,
      opacity: 1,
    };
    const newLayers = [...canvasState.layers, newLayer];
    dispatchCanvas({ type: "SET_LAYERS", layers: newLayers });
    dispatchCanvas({ type: "SET_ACTIVE_LAYER", id: newLayer.id });
  };

  const removeLayer = (id: number) => {
    const newLayers = canvasState.layers.filter((layer) => layer.id !== id);
    const newActiveLayerId =
      canvasState.activeLayerId === id
        ? newLayers[newLayers.length - 1]?.id || null
        : canvasState.activeLayerId;
    dispatchCanvas({ type: "SET_LAYERS", layers: newLayers });
    dispatchCanvas({ type: "SET_ACTIVE_LAYER", id: newActiveLayerId });
  };

  const moveLayer = (id: number, direction: "up" | "down") => {
    const index = canvasState.layers.findIndex((layer) => layer.id === id);
    if (index === -1) return;
    const newLayers = [...canvasState.layers];
    const [removed] = newLayers.splice(index, 1);
    newLayers.splice(direction === "up" ? index - 1 : index + 1, 0, removed);
    dispatchCanvas({ type: "SET_LAYERS", layers: newLayers });
  };

  const toggleLayerVisibility = (id: number) => {
    const newLayers = canvasState.layers.map((layer) =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    );
    dispatchCanvas({ type: "SET_LAYERS", layers: newLayers });
  };

  const setLayerOpacity = (id: number, opacity: number) => {
    const newLayers = canvasState.layers.map((layer) =>
      layer.id === id ? { ...layer, opacity } : layer
    );
    dispatchCanvas({ type: "SET_LAYERS", layers: newLayers });
  };

  const renameLayer = (id: number, newName: string) => {
    const newLayers = canvasState.layers.map((layer) =>
      layer.id === id ? { ...layer, name: newName } : layer
    );
    dispatchCanvas({ type: "SET_LAYERS", layers: newLayers });
  };

  return (
    <div className="space-y-4">
      <Button onClick={addLayer} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Añadir Capa
      </Button>
      {canvasState.layers.map((layer, index) => (
        <div key={layer.id} className="p-2 border rounded">
          <div className="flex items-center justify-between mb-2">
            <Button
              size="sm"
              variant={
                layer.id === canvasState.activeLayerId ? "default" : "outline"
              }
              onClick={() =>
                dispatchCanvas({ type: "SET_ACTIVE_LAYER", id: layer.id })
              }
              className="mr-2"
            >
              {layer.name}
            </Button>
            <div className="flex items-center">
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  const newName = prompt(
                    "Nuevo nombre para la capa:",
                    layer.name
                  );
                  if (newName) renameLayer(layer.id, newName);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => toggleLayerVisibility(layer.id)}
              >
                {layer.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => moveLayer(layer.id, "up")}
                disabled={index === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => moveLayer(layer.id, "down")}
                disabled={index === canvasState.layers.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => removeLayer(layer.id)}
                disabled={canvasState.layers.length === 1}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor={`opacity-${layer.id}`}>Opacidad</Label>
            <Slider
              id={`opacity-${layer.id}`}
              min={0}
              max={1}
              step={0.01}
              value={[layer.opacity]}
              onValueChange={(value) => setLayerOpacity(layer.id, value[0])}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
