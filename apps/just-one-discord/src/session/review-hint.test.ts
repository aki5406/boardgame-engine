import { describe, expect, it } from "vitest";

import {
  createGame,
  createJustOneEngine,
  startDuplicateReview,
  startGame,
  submitHint
} from "@boardgame/game-just-one";

import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { toggleJustOneReviewHint } from "./review-hint.js";
import { getJustOneState } from "./state.js";

describe("toggleJustOneReviewHint", () => {
  it("toggles a hint using the latest registered session", () => {
    const { engine, registry } = setupDuplicateReview();

    const excluded = toggleJustOneReviewHint({
      threadId: "review-thread-1",
      actorId: "player-2",
      playerId: "player-3",
      engine,
      registry
    });

    expect(excluded.status).toBe("updated");
    expect(getJustOneState(registry.get("channel-1")!).excludedHintPlayerIds).toEqual(["player-3"]);

    const restored = toggleJustOneReviewHint({
      threadId: "review-thread-1",
      actorId: "player-2",
      playerId: "player-3",
      engine,
      registry
    });

    expect(restored.status).toBe("updated");
    expect(getJustOneState(registry.get("channel-1")!).excludedHintPlayerIds).toEqual([]);
  });

  it("rejects guessers, non-players, and unknown review threads", () => {
    const { engine, registry } = setupDuplicateReview();

    expect(
      toggleJustOneReviewHint({
        threadId: "review-thread-1",
        actorId: "player-1",
        playerId: "player-2",
        engine,
        registry
      })
    ).toEqual({ status: "notHintPlayer" });
    expect(
      toggleJustOneReviewHint({
        threadId: "review-thread-1",
        actorId: "player-4",
        playerId: "player-2",
        engine,
        registry
      })
    ).toEqual({ status: "notHintPlayer" });
    expect(
      toggleJustOneReviewHint({
        threadId: "missing-thread",
        actorId: "player-2",
        playerId: "player-3",
        engine,
        registry
      })
    ).toEqual({ status: "invalidThread" });
  });

  it("does not update state for a hint that is no longer available", () => {
    const { engine, registry } = setupDuplicateReview();

    const result = toggleJustOneReviewHint({
      threadId: "review-thread-1",
      actorId: "player-2",
      playerId: "missing-player",
      engine,
      registry
    });

    expect(result).toEqual({ status: "hintNotFound" });
    expect(getJustOneState(registry.get("channel-1")!).excludedHintPlayerIds).toEqual([]);
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

  registry.register({
    channelId: "channel-1",
    session: review.session
  });
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
