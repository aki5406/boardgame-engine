import type { EngineState } from "@boardgame/engine";

export type PlayerId = string;

export type JustOnePhase = "waiting" | "hinting" | "guessing" | "revealed" | "finished";

export type JustOneState = EngineState &
  Readonly<{
    phase: JustOnePhase;
    players: readonly PlayerId[];
    guesserId: PlayerId | null;
    secretWord: string | null;
  }>;
