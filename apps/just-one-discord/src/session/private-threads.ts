import type { JustOneDiscordSessionRegistry, JustOneDiscordSession } from "./registry.js";
import { getJustOneState } from "./state.js";

export interface CreateJustOnePrivateHintThreadInput {
  readonly playerId: string;
  readonly secretWord: string;
  readonly threadName: string;
}

export interface CreateJustOnePrivateHintThreadResult {
  readonly threadId: string;
}

export interface CreateJustOnePrivateHintThreadsInput {
  readonly channelId: string;
  readonly session: JustOneDiscordSession;
  readonly registry: JustOneDiscordSessionRegistry;
  readonly createPrivateHintThread: (
    input: CreateJustOnePrivateHintThreadInput
  ) => Promise<CreateJustOnePrivateHintThreadResult>;
  readonly createThreadName: (input: { playerId: string }) => string;
}

export type CreateJustOnePrivateHintThreadsResult =
  | Readonly<{ status: "created"; createdCount: number }>
  | Readonly<{ status: "partialFailure"; createdCount: number; failedCount: number }>;

export async function createJustOnePrivateHintThreads(
  input: CreateJustOnePrivateHintThreadsInput
): Promise<CreateJustOnePrivateHintThreadsResult> {
  const state = getJustOneState(input.session);

  if (!state.guesserId || !state.secretWord) {
    throw new Error("Cannot create Just One private hint threads before the game has started");
  }

  const hintPlayers = input.session.players.filter((player) => player.id !== state.guesserId);
  let createdCount = 0;
  let failedCount = 0;

  for (const player of hintPlayers) {
    try {
      const thread = await input.createPrivateHintThread({
        playerId: player.id,
        secretWord: state.secretWord,
        threadName: input.createThreadName({ playerId: player.id })
      });

      input.registry.registerHintThread({
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
    return {
      status: "partialFailure",
      createdCount,
      failedCount
    };
  }

  return {
    status: "created",
    createdCount
  };
}
