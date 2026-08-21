import { defaultWords, startGame, type Engine, type JustOneRandom } from "@boardgame/game-just-one";

import { getJustOneState } from "./state.js";
import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type StartJustOneDiscordSessionResult =
  | Readonly<{
      status: "started";
      guesserId: string;
      hintPlayerCount: number;
      playerCount: number;
      roundNumber: number;
      secretWord: string;
      session: JustOneDiscordSession;
    }>
  | Readonly<{ status: "noPlayers" }>
  | Readonly<{ status: "notFound" }>;

export interface StartJustOneDiscordSessionInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
  readonly random?: JustOneRandom;
  readonly words?: readonly string[];
}

export function startJustOneDiscordSession(
  input: StartJustOneDiscordSessionInput
): StartJustOneDiscordSessionResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  if (session.players.length === 0) {
    return { status: "noPlayers" };
  }

  const nextSession = startGame({
    engine: input.engine,
    session,
    ...(input.random ? { random: input.random } : {}),
    words: input.words ?? defaultWords
  });
  const nextState = getJustOneState(nextSession);

  input.registry.register({
    channelId: input.channelId,
    session: nextSession
  });

  if (!nextState.guesserId || !nextState.secretWord) {
    throw new Error("Failed to start Just One with guesser and secret word");
  }

  return {
    status: "started",
    guesserId: nextState.guesserId,
    hintPlayerCount: nextSession.players.length - 1,
    playerCount: nextSession.players.length,
    roundNumber: nextState.roundNumber,
    secretWord: nextState.secretWord,
    session: nextSession
  };
}
