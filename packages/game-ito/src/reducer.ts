import type { EngineEvent, EngineReducer, EngineState } from "@boardgame/engine";

import type { ItoEvent } from "./event.js";
import type { ItoState } from "./state.js";

export type ItoReducer = (state: ItoState, event: ItoEvent) => ItoState;

export const reduceItoState: ItoReducer = (state, event) => {
  switch (event.type) {
    case "ito.themeSelected":
      return {
        ...state,
        phase: "themeSelected",
        theme: event.theme
      };

    case "ito.numbersAssigned":
      return {
        ...state,
        phase: "numbersAssigned",
        assignedNumbers: event.assignments
      };

    case "ito.hintSubmitted":
      return {
        ...state,
        phase: "hintsSubmitted",
        hints: [
          ...(state.hints ?? []),
          {
            playerId: event.playerId,
            hint: event.hint
          }
        ]
      };

    case "ito.revealOrderSubmitted":
      return {
        ...state,
        phase: "revealOrderSubmitted",
        revealOrder: event.playerIds
      };

    case "ito.resultRevealed":
      return {
        ...state,
        phase: "resultRevealed",
        result: {
          success: event.success
        }
      };
  }
};

export const itoReducer: EngineReducer = (state: EngineState, event: EngineEvent) => {
  if (!isItoEvent(event)) {
    return state;
  }

  return reduceItoState(state as ItoState, event);
};

function isItoEvent(event: EngineEvent): event is ItoEvent {
  return (
    event.type === "ito.themeSelected" ||
    event.type === "ito.numbersAssigned" ||
    event.type === "ito.hintSubmitted" ||
    event.type === "ito.revealOrderSubmitted" ||
    event.type === "ito.resultRevealed"
  );
}
