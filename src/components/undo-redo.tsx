import { Undo, Redo } from "lucide-react";
import { useAtom } from "jotai";
import { canvasAtom, historyAtom } from "../libs/atoms";
import { Button } from "./ui/button";

export function UndoRedo() {
  const [historyState, dispatchHistory] = useAtom(historyAtom);
  const [, dispatchCanvas] = useAtom(canvasAtom);

  const handleUndo = () => {
    if (historyState.past.length > 0) {
      dispatchHistory({ type: "UNDO" });
      const previousState = historyState.past[historyState.past.length - 1];
      dispatchCanvas({ type: "SET_CANVAS_STATE", state: previousState });
    }
  };

  const handleRedo = () => {
    if (historyState.future.length > 0) {
      dispatchHistory({ type: "REDO" });
      const nextState = historyState.future[0];
      dispatchCanvas({ type: "SET_CANVAS_STATE", state: nextState });
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        onClick={handleUndo}
        disabled={historyState.past.length === 0}
        size="icon"
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        onClick={handleRedo}
        disabled={historyState.future.length === 0}
        size="icon"
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  );
}
