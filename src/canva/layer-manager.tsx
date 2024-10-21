"use client";

import { useAtom } from "jotai";
import { gridAtom } from "../libs/atoms";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Eye, EyeOff, Trash2, Plus, Layers } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";

export default function LayerManager() {
  const [state, dispatch] = useAtom(gridAtom);

  return (
    <div className="p-4 space-y-4 rounded-lg ">
      <h2 className="flex items-center mb-4 text-2xl font-bold">
        <Layers className="mr-2" />
        Layers
      </h2>
      {state.layers.map((layer) => (
        <div key={layer.id} className="flex flex-col gap-2">
          <div className="flex items-center p-2 space-x-4 rounded-md bg-secondary">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      dispatch({
                        type: "TOGGLE_LAYER_VISIBILITY",
                        layerId: layer.id,
                      })
                    }
                  >
                    {layer.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{layer.visible ? "Hide layer" : "Show Layer"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Input
              className="flex-grow"
              value={layer.name}
              onChange={(e) =>
                dispatch({
                  type: "RENAME_LAYER",
                  layerId: layer.id,
                  name: e.target.value,
                })
              }
            />

            <Button
              variant={layer.id === state.activeLayerId ? "default" : "outline"}
              onClick={() =>
                dispatch({ type: "SET_ACTIVE_LAYER", layerId: layer.id })
              }
            >
              {layer.id === state.activeLayerId ? "ON" : "OFF"}
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="min-w-6"
                    onClick={() =>
                      dispatch({ type: "REMOVE_LAYER", layerId: layer.id })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Layer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center space-x-2">
            <Slider
              className="w-full"
              min={0}
              max={1}
              step={0.1}
              value={[layer.opacity]}
              onValueChange={(value) =>
                dispatch({
                  type: "SET_LAYER_OPACITY",
                  layerId: layer.id,
                  opacity: value[0],
                })
              }
            />
          </div>
        </div>
      ))}
      <Button
        onClick={() => dispatch({ type: "ADD_LAYER" })}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" /> New layer
      </Button>
    </div>
  );
}
