import { useSetAtom } from "jotai";
import { gridAtom } from "../libs/atoms";
import { Input } from "../components/ui/input";

function BrushSizeSelector() {
  const setGridState = useSetAtom(gridAtom);

  const handleBrushSizeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGridState({
      type: "SET_BRUSH_SIZE",
      payload: Number(event.target.value),
    });
  };

  return (
    <div>
      <label htmlFor="brushSize">Brush Size:</label>
      <Input
        id="brushSize"
        type="number"
        min="1"
        max="10"
        defaultValue="1"
        onChange={handleBrushSizeChange}
      />
    </div>
  );
}

export default BrushSizeSelector;
