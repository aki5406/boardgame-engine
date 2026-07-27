import {
  startDuplicateReview,
  type Engine,
  type StartDuplicateReviewResult
} from "@boardgame/game-just-one";

import { getJustOneState } from "./state.js";
import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type StartJustOneDuplicateReviewResult =
  | Readonly<{ status: "started"; session: JustOneDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "notReady" }>
  | Readonly<{ status: "alreadyStarted" }>
  | Readonly<{ status: "duplicateReviewThreadExists" }>;

export interface StartJustOneDuplicateReviewInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export interface CreateJustOneDuplicateReviewThreadInput {
  readonly channelId: string;
  readonly session: JustOneDiscordSession;
  readonly registry: JustOneDiscordSessionRegistry;
  readonly createPrivateThread: (input: {
    readonly threadName: string;
    readonly hintPlayerIds: readonly string[];
    readonly content: string;
  }) => Promise<{ readonly threadId: string }>;
  readonly threadName: string;
  readonly content: string;
}

export type CreateJustOneDuplicateReviewThreadResult =
  | Readonly<{ status: "created"; threadId: string }>
  | Readonly<{ status: "alreadyExists"; threadId: string }>;

export function startJustOneDuplicateReviewForChannel(
  input: StartJustOneDuplicateReviewInput
): StartJustOneDuplicateReviewResult {
  if (input.registry.getDuplicateReviewThreadByChannelId(input.channelId)) {
    return { status: "duplicateReviewThreadExists" };
  }

  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = startDuplicateReview({
    engine: input.engine,
    session
  });

  if (result.status === "started") {
    input.registry.register({
      channelId: input.channelId,
      session: result.session
    });

    return {
      status: "started",
      session: result.session
    };
  }

  return mapStartDuplicateReviewFailure(result);
}

export async function createJustOneDuplicateReviewThread(
  input: CreateJustOneDuplicateReviewThreadInput
): Promise<CreateJustOneDuplicateReviewThreadResult> {
  const existingThread = input.registry.getDuplicateReviewThreadByChannelId(input.channelId);

  if (existingThread) {
    return {
      status: "alreadyExists",
      threadId: existingThread.threadId
    };
  }

  const state = getJustOneState(input.session);
  const hintPlayerIds = state.players.filter((playerId) => playerId !== state.guesserId);
  const thread = await input.createPrivateThread({
    threadName: input.threadName,
    hintPlayerIds,
    content: input.content
  });

  input.registry.registerDuplicateReviewThread({
    threadId: thread.threadId,
    sessionId: input.session.id,
    channelId: input.channelId
  });

  return {
    status: "created",
    threadId: thread.threadId
  };
}

function mapStartDuplicateReviewFailure(
  result: Exclude<
    StartDuplicateReviewResult,
    Readonly<{ status: "started"; session: JustOneDiscordSession }>
  >
): Exclude<
  StartJustOneDuplicateReviewResult,
  Readonly<{ status: "started"; session: JustOneDiscordSession }>
> {
  if (result.status === "invalidPhase") {
    return { status: "alreadyStarted" };
  }

  return { status: "notReady" };
}
