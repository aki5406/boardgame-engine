import { excludeHint, restoreHint, type Engine } from "@boardgame/game-just-one";

import { getJustOneState } from "./state.js";
import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type ToggleJustOneReviewHintResult =
  | Readonly<{ status: "updated"; session: JustOneDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidThread" }>
  | Readonly<{ status: "notHintPlayer" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "hintNotFound" }>;

export interface ToggleJustOneReviewHintInput {
  readonly threadId: string;
  readonly actorId: string;
  readonly playerId: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function toggleJustOneReviewHint(
  input: ToggleJustOneReviewHintInput
): ToggleJustOneReviewHintResult {
  const reviewThread = input.registry.getDuplicateReviewThread(input.threadId);

  if (!reviewThread) {
    return { status: "invalidThread" };
  }

  const session = input.registry.get(reviewThread.channelId);

  if (!session || session.id !== reviewThread.sessionId) {
    return { status: "notFound" };
  }

  const state = getJustOneState(session);

  if (state.phase !== "duplicateReview") {
    return { status: "invalidPhase" };
  }

  if (!state.players.includes(input.actorId) || state.guesserId === input.actorId) {
    return { status: "notHintPlayer" };
  }

  const result = state.excludedHintPlayerIds.includes(input.playerId)
    ? restoreHint({ engine: input.engine, session, playerId: input.playerId })
    : excludeHint({ engine: input.engine, session, playerId: input.playerId });

  if (result.status === "excluded" || result.status === "restored") {
    input.registry.register({
      channelId: reviewThread.channelId,
      session: result.session
    });

    return {
      status: "updated",
      session: result.session
    };
  }

  if (result.status === "invalidPhase") {
    return { status: "invalidPhase" };
  }

  return { status: "hintNotFound" };
}
