import { useAtom } from "jotai";
import {
  Brush,
  Eraser,
  PaintBucket,
  Circle,
  Square,
  SlashIcon,
  LucideIcon,
  WrenchIcon,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { gridAtom } from "../libs/atoms";

type ToolName = "draw" | "erase" | "fill" | "circle" | "square" | "line";

const tools: { name: ToolName; icon: LucideIcon; label: string }[] = [
  { name: "draw", icon: Brush, label: "Draw" },
  { name: "erase", icon: Eraser, label: "Erase" },
  { name: "fill", icon: PaintBucket, label: "Fill" },
  { name: "circle", icon: Circle, label: "Circle" },
  { name: "square", icon: Square, label: "Square" },
  { name: "line", icon: SlashIcon, label: "Line" },
];

export function ToolSelector() {
  const [value, dispatch] = useAtom(gridAtom);

  const handleToolChange = (tool: ToolName) => {
    dispatch({ type: "SET_TOOL", payload: tool });
  };

  return (
    <div className="p-4 space-y-4 rounded-lg ">
      <h2 className="flex items-center mb-4 text-2xl font-bold">
        <WrenchIcon className="mr-2" />
        Tools
      </h2>
      <div className="grid gap-2 lg:grid-cols-3">
        {tools.map(({ name, icon: Icon, label }) => (
          <Button
            key={name}
            onClick={() => handleToolChange(name)}
            className={`flex items-center gap-2 p-2 ${
              value.tool === name
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            } hover:bg-primary/70 hover:text-primary-foreground/70`}
          >
            <Icon size={24} />
            <span>{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
