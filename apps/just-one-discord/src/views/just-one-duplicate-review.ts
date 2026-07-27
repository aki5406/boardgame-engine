import type { JustOneState } from "@boardgame/game-just-one";

export function createJustOneDuplicateReviewThreadName(): string {
  return "just-one-duplicate-review";
}

export function createJustOneDuplicateReviewIntro(state: JustOneState): string {
  const hints = state.players
    .filter((playerId) => playerId !== state.guesserId)
    .flatMap((playerId) => {
      const hint = state.hintsByPlayerId[playerId];

      return hint === undefined ? [] : [hint];
    });

  return [
    "Duplicate review",
    "",
    "Review the submitted hints and identify duplicates.",
    "",
    ...hints.map((hint, index) => `${index + 1}. ${hint}`),
    "",
    "Removal controls will be added in the next step."
  ].join("\n");
}

export function createJustOneDuplicateReviewFailureReply(): string {
  return "All hints were submitted, but duplicate review could not be started.";
}
