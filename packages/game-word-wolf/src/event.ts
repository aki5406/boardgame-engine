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
    minorityPlayerId: PlayerId;
    majorityWord: string;
    minorityWord: string;
  }>;

export type WordWolfVotingStartedEvent = EngineEvent &
  Readonly<{
    type: "word-wolf.votingStarted";
  }>;

export type WordWolfEvent =
  | WordWolfGameCreatedEvent
  | WordWolfPlayerJoinedEvent
  | WordWolfGameStartedEvent
  | WordWolfVotingStartedEvent;
