import type { EngineEvent } from "@boardgame/engine";

export type ItoEvent =
  | ItoThemeSelectedEvent
  | ItoNumbersAssignedEvent
  | ItoDiscussionStartedEvent
  | ItoHintSubmittedEvent
  | ItoOrderSubmissionStartedEvent
  | ItoOrderSubmittedEvent
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

export type ItoDiscussionStartedEvent = EngineEvent &
  Readonly<{
    type: "ito.discussionStarted";
  }>;

export type ItoHintSubmittedEvent = EngineEvent &
  Readonly<{
    type: "ito.hintSubmitted";
    playerId: string;
    hint: string;
  }>;

export type ItoOrderSubmissionStartedEvent = EngineEvent &
  Readonly<{
    type: "ito.orderSubmissionStarted";
  }>;

export type ItoOrderSubmittedEvent = EngineEvent &
  Readonly<{
    type: "ito.orderSubmitted";
    playerIds: readonly string[];
  }>;

export type ItoResultRevealedEvent = EngineEvent &
  Readonly<{
    type: "ito.resultRevealed";
    success: boolean;
  }>;
