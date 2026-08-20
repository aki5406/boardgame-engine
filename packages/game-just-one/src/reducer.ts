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
        guesserId: event.guesserId,
        secretWord: event.secretWord,
        guess: null,
        result: null,
        hintsByPlayerId: {},
        excludedHintPlayerIds: []
      };

    case "just-one.hintSubmitted":
      return {
        ...state,
        hintsByPlayerId: {
          ...state.hintsByPlayerId,
          [event.playerId]: event.hint
        }
      };

    case "just-one.duplicateReviewStarted":
      return {
        ...state,
        phase: "duplicateReview"
      };

    case "just-one.hintExcluded":
      if (state.excludedHintPlayerIds.includes(event.playerId)) {
        return state;
      }

      return {
        ...state,
        excludedHintPlayerIds: [...state.excludedHintPlayerIds, event.playerId]
      };

    case "just-one.hintRestored":
      return {
        ...state,
        excludedHintPlayerIds: state.excludedHintPlayerIds.filter(
          (playerId) => playerId !== event.playerId
        )
      };

    case "just-one.duplicateReviewConfirmed":
      return {
        ...state,
        phase: "guessing"
      };

    case "just-one.guessSubmitted":
      return {
        ...state,
        phase: "answered",
        guess: event.guess
      };

    case "just-one.resultConfirmed":
      return {
        ...state,
        phase: "resultConfirmed",
        result: event.result
      };

    default:
      return state;
  }
}
