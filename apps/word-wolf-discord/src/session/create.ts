import { createGame, type Engine } from "@boardgame/game-word-wolf";

import type { WordWolfDiscordSession, WordWolfDiscordSessionRegistry } from "./registry.js";

export type CreateWordWolfDiscordSessionResult =
  | Readonly<{ status: "created"; session: WordWolfDiscordSession }>
  | Readonly<{ status: "alreadyExists"; session: WordWolfDiscordSession }>;

export interface CreateWordWolfDiscordSessionInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: WordWolfDiscordSessionRegistry;
}

export function createWordWolfDiscordSessionForChannel(
  input: CreateWordWolfDiscordSessionInput
): CreateWordWolfDiscordSessionResult {
  const existingSession = input.registry.get(input.channelId);

  if (existingSession) {
    return { status: "alreadyExists", session: existingSession };
  }

  const session = createGame({
    engine: input.engine,
    id: `word-wolf:${input.channelId}`
  });
  input.registry.register({ channelId: input.channelId, session });

  return { status: "created", session };
}
