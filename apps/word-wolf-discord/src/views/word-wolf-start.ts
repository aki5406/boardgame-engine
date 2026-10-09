export function createWordWolfPrivateWordMessage(word: string): string {
  return `Your word: ${word}`;
}

export function createWordWolfStartedReply(playerCount: number): string {
  return [
    "Word Wolf started.",
    "",
    `Players: ${playerCount}`,
    "Check your private thread for your word and start discussing here."
  ].join("\n");
}

export function createWordWolfStartPartialFailureReply(
  playerCount: number,
  createdCount: number,
  failedCount: number
): string {
  return [
    "Word Wolf started, but some private word threads could not be created.",
    "",
    `Players: ${playerCount}`,
    `Threads created: ${createdCount}`,
    `Threads failed: ${failedCount}`
  ].join("\n");
}

export function createWordWolfPrivateThreadName(playerId: string): string {
  return `word-wolf-word-${playerId.slice(-4)}`;
}
