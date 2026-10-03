import type { EngineState } from "@boardgame/engine";

export type PlayerId = string;

export type WordWolfPhase = "waiting" | "discussion";

export type WordWolfState = EngineState &
  Readonly<{
    phase: WordWolfPhase;
    players: readonly PlayerId[];
  }>;

export const wordWolfInitialState: WordWolfState = {
  phase: "waiting",
  players: []
};
