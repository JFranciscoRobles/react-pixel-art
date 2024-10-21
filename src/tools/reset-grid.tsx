import { useSetAtom } from "jotai";
import { gridAtom } from "../libs/atoms";
import { Button } from "../components/ui/button";

const ResetGrid = () => {
  const dispatch = useSetAtom(gridAtom);

  const handleResetGrid = () => {
    dispatch({ type: "RESET_GRID" });
  };

  return (
    <Button variant="destructive" onClick={handleResetGrid}>
      Clear Canva
    </Button>
  );
};

export default ResetGrid;
