export function createJustOneGuesserRoleMessage(): string {
  return [
    "You are the Guesser.",
    "",
    "Wait for hints from the other players.",
    "Do not look at the secret word."
  ].join("\n");
}

export function createJustOneHintPlayerRoleMessage(secretWord: string): string {
  return [
    "You are a Hint Player.",
    "",
    "Secret Word:",
    secretWord,
    "",
    "Submit one hint without using the secret word itself."
  ].join("\n");
}

export function createJustOneStartedReply(guesserId: string, hintPlayerCount: number): string {
  return [
    "Just One started.",
    "",
    `Guesser: <@${guesserId}>`,
    `Hint players: ${hintPlayerCount}`,
    "",
    "Roles have been sent by DM."
  ].join("\n");
}
