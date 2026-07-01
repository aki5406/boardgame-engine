import type { ItoNumberAssignment } from "./event.js";

export type CreateItoNumberAssignmentsInput = Readonly<{
  playerIds: readonly string[];
  numbers: readonly number[];
}>;

export function createItoNumberAssignments(
  input: CreateItoNumberAssignmentsInput
): readonly ItoNumberAssignment[] {
  return input.playerIds.map((playerId, index) => {
    const number = input.numbers[index];

    if (number === undefined) {
      throw new Error(`Missing number for player: ${playerId}`);
    }

    return {
      playerId,
      number
    };
  });
}
