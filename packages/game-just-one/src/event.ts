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
  }>;

export type JustOneEvent = JustOnePlayerJoinedEvent | JustOneGameStartedEvent;
