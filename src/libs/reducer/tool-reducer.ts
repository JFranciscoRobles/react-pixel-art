import { ToolAction, ToolState } from "../types";

export const toolReducer = (
  state: ToolState,
  action: ToolAction
): ToolState => {
  switch (action.type) {
    case "SET_COLOR":
      return { ...state, color: action.color };
    case "SET_TOOL":
      return { ...state, tool: action.tool };
    case "SET_BRUSH_SIZE":
      return { ...state, brushSize: action.size };
    default:
      return state;
  }
};
