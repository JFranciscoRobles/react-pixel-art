import { HistoryAction, HistoryState } from "../types";

export const historyReducer = (
  state: HistoryState,
  action: HistoryAction
): HistoryState => {
  switch (action.type) {
    case "ADD_TO_HISTORY":
      return {
        past: [...state.past, action.state],
        future: [], // Limpiar el futuro cuando se agrega un nuevo estado
      };
    case "UNDO":
      if (state.past.length === 0) return state; // No hay nada que deshacer
      const previousState = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        future: [previousState, ...state.future],
      };
    case "REDO":
      if (state.future.length === 0) return state; // No hay nada que rehacer
      const nextState = state.future[0];
      return {
        past: [...state.past, nextState],
        future: state.future.slice(1),
      };
    default:
      return state;
  }
};
