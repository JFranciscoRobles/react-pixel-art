import { useAtom } from "jotai";
import { undoRedoActionsAtom } from "../libs/atoms";
import { Undo2, Redo2 } from "lucide-react";
import { Button } from "../components/ui/button";

export default function UndoRedo() {
  const [value, dispatch] = useAtom(undoRedoActionsAtom);

  const handleUndo = () => {
    dispatch("UNDO");
  };

  const handleRedo = () => {
    dispatch("REDO");
  };

  return (
    <div className="flex items-center justify-center p-4 space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleUndo}
        disabled={value.history?.length <= 1}
        aria-label="Undo"
        className="w-10 h-10"
      >
        <Undo2 className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleRedo}
        disabled={value.future?.length === 0}
        aria-label="Redo"
        className="w-10 h-10"
      >
        <Redo2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
