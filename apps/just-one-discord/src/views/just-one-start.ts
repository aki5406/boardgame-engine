export function createJustOneHintPlayerThreadIntro(secretWord: string): string {
  return [
    "You are a Hint Player.",
    "",
    "Secret Word:",
    secretWord,
    "",
    "Reply with exactly one hint.",
    "Do not use the secret word itself."
  ].join("\n");
}

export function createJustOneStartedReply(guesserId: string, hintPlayerCount: number): string {
  return [
    "Just One started.",
    "",
    `Guesser: <@${guesserId}>`,
    `Hint players: ${hintPlayerCount}`,
    "",
    "Private hint threads have been created."
  ].join("\n");
}

export function createJustOneStartPartialFailureReply(
  guesserId: string,
  hintPlayerCount: number,
  createdCount: number,
  failedCount: number
): string {
  return [
    "Just One started, but failed to create one or more private hint threads.",
    "",
    `Guesser: <@${guesserId}>`,
    `Hint players: ${hintPlayerCount}`,
    `Threads created: ${createdCount}`,
    `Threads failed: ${failedCount}`
  ].join("\n");
}

export function createJustOneHintThreadName(playerId: string): string {
  const suffix = playerId.slice(-4);

  return `just-one-hint-${suffix}`;
}
