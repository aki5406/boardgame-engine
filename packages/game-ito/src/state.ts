import type { EngineState } from "@boardgame/engine";

export type ItoPhase =
  | "waitingForPlayers"
  | "themeSelected"
  | "numbersAssigned"
  | "discussion"
  | "orderSubmission"
  | "orderSubmitted"
  | "resultRevealed";

export type ItoState = EngineState &
  Readonly<{
    phase: ItoPhase;
    players: readonly ItoPlayer[];
    theme?: string;
    assignedNumbers?: readonly ItoAssignedNumber[];
    hints?: readonly ItoHint[];
    revealOrder?: readonly string[];
    result?: ItoResult;
  }>;

export type ItoPlayer = Readonly<{
  id: string;
}>;

export type ItoAssignedNumber = Readonly<{
  playerId: string;
  number: number;
}>;

export type ItoHint = Readonly<{
  playerId: string;
  hint: string;
}>;

export type ItoResult = Readonly<{
  success: boolean;
}>;
