import type { EngineEvent } from "@boardgame/engine";

import type { PlayerId } from "./state.js";

export type WordWolfGameCreatedEvent = EngineEvent &
  Readonly<{
    type: "word-wolf.gameCreated";
  }>;

export type WordWolfPlayerJoinedEvent = EngineEvent &
  Readonly<{
    type: "word-wolf.playerJoined";
    playerId: PlayerId;
  }>;

export type WordWolfGameStartedEvent = EngineEvent &
  Readonly<{
    type: "word-wolf.gameStarted";
  }>;

export type WordWolfEvent =
  | WordWolfGameCreatedEvent
  | WordWolfPlayerJoinedEvent
  | WordWolfGameStartedEvent;
