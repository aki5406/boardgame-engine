import type { EngineState } from "@boardgame/engine";

export type PlayerId = string;

export type JustOnePhase =
  | "waiting"
  | "hinting"
  | "duplicateReview"
  | "guessing"
  | "answered"
  | "resultConfirmed"
  | "roundScored"
  | "revealed"
  | "finished";

export type JustOneState = EngineState &
  Readonly<{
    phase: JustOnePhase;
    players: readonly PlayerId[];
    guesserId: PlayerId | null;
    secretWord: string | null;
    guess: string | null;
    result: "correct" | "incorrect" | null;
    score: number;
    roundNumber: number;
    hintsByPlayerId: Readonly<Record<PlayerId, string>>;
    excludedHintPlayerIds: readonly PlayerId[];
  }>;
