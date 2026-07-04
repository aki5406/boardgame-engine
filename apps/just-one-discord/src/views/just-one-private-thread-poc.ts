export const JUST_ONE_PRIVATE_THREAD_POC_DEFAULT_SECRET_WORD = "Apple";

export function createJustOnePrivateThreadPocIntro(secretWord: string): string {
  return [`Secret Word:`, secretWord, ``, `Reply with exactly one hint.`].join("\n");
}

export function createJustOnePrivateThreadPocReply(
  threadId: string,
  invitedPlayerId: string
): string {
  return [
    "Just One private thread PoC created.",
    `Thread ID: ${threadId}`,
    `Invited player: <@${invitedPlayerId}>`,
    "The bot posted the secret word inside the private thread.",
    "Replies in that thread will be logged and tracked by thread ID."
  ].join("\n");
}
