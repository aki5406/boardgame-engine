import type { EngineReducer } from "@boardgame/engine";

import type { JustOneEvent } from "./event.js";
import type { JustOneState } from "./state.js";

export const justOneReducer: EngineReducer = (state, event) =>
  reduceJustOneState(state as JustOneState, event as JustOneEvent);

export function reduceJustOneState(state: JustOneState, event: JustOneEvent): JustOneState {
  switch (event.type) {
    case "just-one.playerJoined":
      if (state.players.includes(event.playerId)) {
        return state;
      }

      return {
        ...state,
        players: [...state.players, event.playerId]
      };

    case "just-one.gameStarted":
      return {
        ...state,
        phase: "hinting",
        guesserId: event.guesserId
      };

    default:
      return state;
  }
}
