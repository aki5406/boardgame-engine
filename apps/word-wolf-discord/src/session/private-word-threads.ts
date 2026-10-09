import { getAssignedWord, type WordWolfState } from "@boardgame/game-word-wolf";

import type { WordWolfDiscordSession, WordWolfDiscordSessionRegistry } from "./registry.js";

export interface CreateWordWolfPrivateWordThreadInput {
  readonly playerId: string;
  readonly word: string;
  readonly threadName: string;
}

export interface CreateWordWolfPrivateWordThreadResult {
  readonly threadId: string;
}

export interface CreateWordWolfPrivateWordThreadsInput {
  readonly channelId: string;
  readonly session: WordWolfDiscordSession;
  readonly registry: WordWolfDiscordSessionRegistry;
  readonly createPrivateWordThread: (
    input: CreateWordWolfPrivateWordThreadInput
  ) => Promise<CreateWordWolfPrivateWordThreadResult>;
  readonly createThreadName: (input: { playerId: string }) => string;
}

export type CreateWordWolfPrivateWordThreadsResult =
  | Readonly<{ status: "created"; createdCount: number }>
  | Readonly<{ status: "partialFailure"; createdCount: number; failedCount: number }>;

export async function createWordWolfPrivateWordThreads(
  input: CreateWordWolfPrivateWordThreadsInput
): Promise<CreateWordWolfPrivateWordThreadsResult> {
  let createdCount = 0;
  let failedCount = 0;

  for (const player of input.session.players) {
    const word = getAssignedWord(input.session.state as WordWolfState, player.id);

    if (!word) {
      throw new Error("Cannot create Word Wolf private word threads before the game has started");
    }

    try {
      const thread = await input.createPrivateWordThread({
        playerId: player.id,
        word,
        threadName: input.createThreadName({ playerId: player.id })
      });
      input.registry.registerPrivateWordThread({
        threadId: thread.threadId,
        sessionId: input.session.id,
        channelId: input.channelId,
        playerId: player.id
      });
      createdCount += 1;
    } catch {
      failedCount += 1;
    }
  }

  if (failedCount > 0) {
    return { status: "partialFailure", createdCount, failedCount };
  }

  return { status: "created", createdCount };
}
