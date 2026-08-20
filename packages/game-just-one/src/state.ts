import type { EngineState } from "@boardgame/engine";

export type PlayerId = string;

export type JustOnePhase =
  | "waiting"
  | "hinting"
  | "duplicateReview"
  | "guessing"
  | "answered"
  | "resultConfirmed"
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
    hintsByPlayerId: Readonly<Record<PlayerId, string>>;
    excludedHintPlayerIds: readonly PlayerId[];
  }>;
