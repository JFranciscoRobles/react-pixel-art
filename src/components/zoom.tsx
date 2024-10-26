import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useAtom } from "jotai";
import { canvasAtom } from "../libs/atoms";
import { Crosshair1Icon } from "@radix-ui/react-icons";

type Props = {
  containerRef: React.RefObject<HTMLDivElement>;
  canvaRef: React.RefObject<HTMLDivElement>;
};

function Zoom({ containerRef, canvaRef }: Props) {
  const [canvasState, dispatchCanvas] = useAtom(canvasAtom);

  const handleZoom = (delta: number) => {
    dispatchCanvas({
      type: "SET_ZOOM",
      zoom: Math.max(0.1, Math.min(10, canvasState.zoom + delta)),
    });
  };

  const handleCenterView = () => {
    if (containerRef.current && canvaRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const newZoom = Math.min(
        containerWidth / canvasState.canvasWidth,
        containerHeight / canvasState.canvasHeight,
        1
      );

      dispatchCanvas({ type: "SET_ZOOM", zoom: newZoom });

      const canvasWidth = canvasState.canvasWidth * newZoom;
      const canvasHeight = canvasState.canvasHeight * newZoom;

      const x = (containerWidth - canvasWidth) / 2;
      const y = (containerHeight - canvasHeight) / 2;

      dispatchCanvas({ type: "SET_PAN", x, y });
    }
  };

  useEffect(() => {
    handleCenterView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center w-full gap-4">
      <div className="flex items-center space-x-2">
        <Button size="icon" onClick={() => handleZoom(-0.1)}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span>{(canvasState.zoom * 100).toFixed(0)}%</span>
        <Button size="icon" onClick={() => handleZoom(0.1)}>
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>
      <Button onClick={handleCenterView}>
        <Crosshair1Icon className="w-4 h-4" /> Centrar Vista
      </Button>
    </div>
  );
}

export default Zoom;
