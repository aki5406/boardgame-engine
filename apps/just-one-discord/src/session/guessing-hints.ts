import { getRemainingHints } from "@boardgame/game-just-one";

import { getJustOneState } from "./state.js";
import type { JustOneDiscordSessionRegistry } from "./registry.js";

export type GetJustOneGuessingHintsResult =
  | Readonly<{
      status: "ready";
      guesserId: string;
      hints: readonly string[];
    }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidState" }>;

export interface GetJustOneGuessingHintsInput {
  readonly channelId: string;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function getJustOneGuessingHints(
  input: GetJustOneGuessingHintsInput
): GetJustOneGuessingHintsResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const state = getJustOneState(session);

  if (state.phase !== "guessing" || !state.guesserId || !state.secretWord) {
    return { status: "invalidState" };
  }

  const secretWord = state.secretWord;

  return {
    status: "ready",
    guesserId: state.guesserId,
    hints: getRemainingHints(state)
      .map((hint) => hint.hint)
      .filter((hint) => !includesSecretWord(hint, secretWord))
  };
}

function includesSecretWord(hint: string, secretWord: string): boolean {
  return hint.toLocaleLowerCase().includes(secretWord.toLocaleLowerCase());
}
