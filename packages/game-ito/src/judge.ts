import type { ItoResultRevealedEvent } from "./event.js";
import type { ItoAssignedNumber } from "./state.js";

export type JudgeItoOrderInput = Readonly<{
  assignedNumbers: readonly ItoAssignedNumber[];
  submittedOrder: readonly string[];
}>;

export function judgeItoOrder(input: JudgeItoOrderInput): ItoResultRevealedEvent {
  const numbersByPlayerId = new Map(
    input.assignedNumbers.map((assignment) => [assignment.playerId, assignment.number])
  );
  const submittedNumbers = input.submittedOrder.map((playerId) => numbersByPlayerId.get(playerId));
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
