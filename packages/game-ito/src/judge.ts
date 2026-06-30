import type { ItoResultRevealedEvent } from "./event.js";
import type { ItoAssignedNumber } from "./state.js";

export type JudgeItoRevealOrderInput = Readonly<{
  assignedNumbers: readonly ItoAssignedNumber[];
  revealOrder: readonly string[];
}>;

export function judgeItoRevealOrder(input: JudgeItoRevealOrderInput): ItoResultRevealedEvent {
  const numbersByPlayerId = new Map(
    input.assignedNumbers.map((assignment) => [assignment.playerId, assignment.number])
  );
  const submittedNumbers = input.revealOrder.map((playerId) => numbersByPlayerId.get(playerId));
  const success =
    submittedNumbers.every((number) => number !== undefined) &&
    submittedNumbers.every(
      (number, index) => index === 0 || submittedNumbers[index - 1]! <= number!
    );

  return {
    type: "ito.resultRevealed",
    success
  };
}
