export interface JustOneGuessingHintsMessageInput {
  readonly guesserId: string;
  readonly hints: readonly string[];
}

export function createJustOneGuessingHintsMessage(input: JustOneGuessingHintsMessageInput): string {
  const hintLines =
    input.hints.length === 0 ? ["No hints remain."] : input.hints.map((hint) => `- ${hint}`);

  return [
    `Hints for <@${input.guesserId}>`,
    "",
    ...hintLines,
    "",
    input.hints.length === 0
      ? "Guesser, make your best guess."
      : "Guesser, think of the secret word."
  ].join("\n");
}
