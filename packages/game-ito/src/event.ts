import type { EngineEvent } from "@boardgame/engine";

export type ItoEvent =
  | ItoThemeSelectedEvent
  | ItoNumbersAssignedEvent
  | ItoHintSubmittedEvent
  | ItoRevealOrderSubmittedEvent
  | ItoResultRevealedEvent;

export type ItoThemeSelectedEvent = EngineEvent &
  Readonly<{
    type: "ito.themeSelected";
    theme: string;
  }>;

export type ItoNumbersAssignedEvent = EngineEvent &
  Readonly<{
    type: "ito.numbersAssigned";
    assignments: readonly ItoNumberAssignment[];
  }>;

export type ItoNumberAssignment = Readonly<{
  playerId: string;
  number: number;
}>;

export type ItoHintSubmittedEvent = EngineEvent &
  Readonly<{
    type: "ito.hintSubmitted";
    playerId: string;
    hint: string;
  }>;

export type ItoRevealOrderSubmittedEvent = EngineEvent &
  Readonly<{
    type: "ito.revealOrderSubmitted";
    playerIds: readonly string[];
  }>;

export type ItoResultRevealedEvent = EngineEvent &
  Readonly<{
    type: "ito.resultRevealed";
    success: boolean;
  }>;
