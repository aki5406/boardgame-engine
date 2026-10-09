import type { EngineReducer } from "@boardgame/engine";

import type { WordWolfEvent } from "./event.js";
import { wordWolfInitialState, type WordWolfState } from "./state.js";

export const wordWolfReducer: EngineReducer = (state, event) =>
  reduceWordWolfState(state as WordWolfState, event as WordWolfEvent);

export function reduceWordWolfState(state: WordWolfState, event: WordWolfEvent): WordWolfState {
  switch (event.type) {
    case "word-wolf.gameCreated":
      return wordWolfInitialState;

    case "word-wolf.playerJoined":
      if (state.players.includes(event.playerId)) {
        return state;
      }

      return {
        ...state,
        players: [...state.players, event.playerId]
      };

    case "word-wolf.gameStarted":
      return {
        ...state,
        phase: "discussion",
        minorityPlayerId: event.minorityPlayerId,
        majorityWord: event.majorityWord,
        minorityWord: event.minorityWord
      };

    case "word-wolf.votingStarted":
      return {
        ...state,
        phase: "voting"
      };
  }
}
