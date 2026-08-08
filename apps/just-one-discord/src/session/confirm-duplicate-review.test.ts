import { describe, expect, it } from "vitest";

import {
  createGame,
  createJustOneEngine,
  startDuplicateReview,
  startGame,
  submitHint
} from "@boardgame/game-just-one";

import { confirmJustOneDuplicateReview } from "./confirm-duplicate-review.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { getJustOneState } from "./state.js";

describe("confirmJustOneDuplicateReview", () => {
  it("confirms the latest session for a hint player", () => {
    const { engine, registry } = setupDuplicateReview();

    const result = confirmJustOneDuplicateReview({
      threadId: "review-thread-1",
      actorId: "player-2",
      engine,
      registry
    });

    expect(result.status).toBe("confirmed");
    expect(getJustOneState(registry.get("channel-1")!).phase).toBe("guessing");
  });

  it("rejects guessers, non-players, unknown threads, and a repeated confirmation", () => {
    const { engine, registry } = setupDuplicateReview();

    expect(
      confirmJustOneDuplicateReview({
        threadId: "review-thread-1",
        actorId: "player-1",
        engine,
        registry
      })
    ).toEqual({ status: "notHintPlayer" });
    expect(
      confirmJustOneDuplicateReview({
        threadId: "review-thread-1",
        actorId: "player-4",
        engine,
        registry
      })
    ).toEqual({ status: "notHintPlayer" });
    expect(
      confirmJustOneDuplicateReview({
        threadId: "missing-thread",
        actorId: "player-2",
        engine,
        registry
      })
    ).toEqual({ status: "invalidThread" });

    expect(
      confirmJustOneDuplicateReview({
        threadId: "review-thread-1",
        actorId: "player-2",
        engine,
        registry
      })
    ).toMatchObject({ status: "confirmed" });
    expect(
      confirmJustOneDuplicateReview({
        threadId: "review-thread-1",
        actorId: "player-2",
        engine,
        registry
      })
    ).toEqual({ status: "invalidPhase" });
  });
});

function setupDuplicateReview() {
  const engine = createJustOneEngine();
  const registry = createJustOneDiscordSessionRegistry();
  const hintingSession = startGame({
    engine,
    session: createGame({
      engine,
      id: "just-one:channel-1",
      playerIds: ["player-1", "player-2", "player-3"]
    }),
    random: createSequenceRandom([0, 0]),
    words: ["Apple"]
  });
  const firstHint = submitHint({
    engine,
    session: hintingSession,
    playerId: "player-2",
    hint: "Fruit"
  });

  if (firstHint.status !== "submitted") {
    throw new Error("Expected first hint submission to succeed");
  }

  const secondHint = submitHint({
    engine,
    session: firstHint.session,
    playerId: "player-3",
    hint: "Red"
  });

  if (secondHint.status !== "submitted") {
    throw new Error("Expected second hint submission to succeed");
  }

  const review = startDuplicateReview({ engine, session: secondHint.session });

  if (review.status !== "started") {
    throw new Error("Expected duplicate review to start");
  }

  registry.register({ channelId: "channel-1", session: review.session });
  registry.registerDuplicateReviewThread({
    threadId: "review-thread-1",
    sessionId: review.session.id,
    channelId: "channel-1",
    messageId: "review-message-1"
  });

  return { engine, registry };
}

function createSequenceRandom(values: readonly number[]): () => number {
  let index = 0;

  return () => {
    const value = values[index];

    if (value === undefined) {
      throw new Error("Missing random value for test");
    }

    index += 1;
    return value;
  };
}
