import type { EngineEvent } from "@boardgame/engine";

import type { PlayerId } from "./state.js";

export type JustOnePlayerJoinedEvent = EngineEvent &
  Readonly<{
    type: "just-one.playerJoined";
    playerId: PlayerId;
  }>;

export type JustOneGameStartedEvent = EngineEvent &
  Readonly<{
    type: "just-one.gameStarted";
    guesserId: PlayerId;
    secretWord: string;
  }>;

export type JustOneHintSubmittedEvent = EngineEvent &
  Readonly<{
    type: "just-one.hintSubmitted";
    playerId: PlayerId;
    hint: string;
  }>;

export type JustOneDuplicateReviewStartedEvent = EngineEvent &
  Readonly<{
    type: "just-one.duplicateReviewStarted";
  }>;

export type JustOneHintExcludedEvent = EngineEvent &
  Readonly<{
    type: "just-one.hintExcluded";
    playerId: PlayerId;
  }>;

export type JustOneHintRestoredEvent = EngineEvent &
  Readonly<{
    type: "just-one.hintRestored";
    playerId: PlayerId;
  }>;

export type JustOneDuplicateReviewConfirmedEvent = EngineEvent &
  Readonly<{
    type: "just-one.duplicateReviewConfirmed";
  }>;

export type JustOneGuessSubmittedEvent = EngineEvent &
  Readonly<{
    type: "just-one.guessSubmitted";
    guess: string;
  }>;

export type JustOneResultConfirmedEvent = EngineEvent &
  Readonly<{
    type: "just-one.resultConfirmed";
    result: "correct" | "incorrect";
  }>;

export type JustOneEvent =
  | JustOnePlayerJoinedEvent
  | JustOneGameStartedEvent
  | JustOneHintSubmittedEvent
  | JustOneDuplicateReviewStartedEvent
  | JustOneHintExcludedEvent
  | JustOneHintRestoredEvent
  | JustOneDuplicateReviewConfirmedEvent
  | JustOneGuessSubmittedEvent
  | JustOneResultConfirmedEvent;
