import type { EngineState } from "@boardgame/engine";

export type PlayerId = string;

export type WordWolfPhase = "waiting" | "discussion";

export type WordWolfState = EngineState &
  Readonly<{
    phase: WordWolfPhase;
    players: readonly PlayerId[];
    minorityPlayerId: PlayerId | null;
    majorityWord: string | null;
    minorityWord: string | null;
  }>;

export const wordWolfInitialState: WordWolfState = {
  phase: "waiting",
  players: [],
  minorityPlayerId: null,
  majorityWord: null,
  minorityWord: null
};
