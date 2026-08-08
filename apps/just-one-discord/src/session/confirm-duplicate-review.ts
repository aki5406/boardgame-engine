import { confirmDuplicateReview, type Engine } from "@boardgame/game-just-one";

import { getJustOneState } from "./state.js";
import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type ConfirmJustOneDuplicateReviewResult =
  | Readonly<{ status: "confirmed"; session: JustOneDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidThread" }>
  | Readonly<{ status: "notHintPlayer" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "invalidState" }>;

export interface ConfirmJustOneDuplicateReviewInput {
  readonly threadId: string;
  readonly actorId: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function confirmJustOneDuplicateReview(
  input: ConfirmJustOneDuplicateReviewInput
): ConfirmJustOneDuplicateReviewResult {
  const reviewThread = input.registry.getDuplicateReviewThread(input.threadId);

  if (!reviewThread) {
    return { status: "invalidThread" };
  }

  const session = input.registry.get(reviewThread.channelId);

  if (!session || session.id !== reviewThread.sessionId) {
    return { status: "notFound" };
  }

  const state = getJustOneState(session);

  if (!state.players.includes(input.actorId) || state.guesserId === input.actorId) {
    return { status: "notHintPlayer" };
  }

  const result = confirmDuplicateReview({
    engine: input.engine,
    session
  });

  if (result.status === "confirmed") {
    input.registry.register({
      channelId: reviewThread.channelId,
      session: result.session
    });

    return {
      status: "confirmed",
      session: result.session
    };
  }

  return result;
}
