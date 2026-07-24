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

export type JustOneEvent =
  | JustOnePlayerJoinedEvent
  | JustOneGameStartedEvent
  | JustOneHintSubmittedEvent;
