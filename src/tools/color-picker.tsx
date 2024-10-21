import { useAtom } from "jotai";
import { gridAtom } from "../libs/atoms";
import { Input } from "../components/ui/input";

const ColorPicker = () => {
  const [value, dispatch] = useAtom(gridAtom);

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_COLOR", payload: event.target.value });
  };

  return (
    <Input type="color" value={value.color} onChange={handleColorChange} />
  );
};

export default ColorPicker;
