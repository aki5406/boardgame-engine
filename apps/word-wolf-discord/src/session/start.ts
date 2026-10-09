import {
  startGame,
  type Engine,
  type WordWolfRandom,
  type WordWolfWordPair
} from "@boardgame/game-word-wolf";

import type { WordWolfDiscordSession, WordWolfDiscordSessionRegistry } from "./registry.js";

export type StartWordWolfDiscordSessionResult =
  | Readonly<{ status: "started"; playerCount: number; session: WordWolfDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "notEnoughPlayers" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "noWordPairs" }>;

export interface StartWordWolfDiscordSessionInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: WordWolfDiscordSessionRegistry;
  readonly random: WordWolfRandom;
  readonly wordPairs?: readonly WordWolfWordPair[];
}

export function startWordWolfDiscordSession(
  input: StartWordWolfDiscordSessionInput
): StartWordWolfDiscordSessionResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = startGame({
    engine: input.engine,
    session,
    random: input.random,
    ...(input.wordPairs ? { wordPairs: input.wordPairs } : {})
  });

  if (result.status !== "started") {
    return result;
  }

  input.registry.register({ channelId: input.channelId, session: result.session });

  return {
    status: "started",
    playerCount: result.session.players.length,
    session: result.session
  };
}
