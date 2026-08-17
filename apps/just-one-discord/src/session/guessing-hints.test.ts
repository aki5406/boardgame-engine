import { describe, expect, it } from "vitest";

import {
  confirmDuplicateReview,
  createGame,
  createJustOneEngine,
  excludeHint,
  startDuplicateReview,
  startGame,
  submitHint
} from "@boardgame/game-just-one";

import { getJustOneGuessingHints, publishJustOneGuessingHints } from "./guessing-hints.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";

describe("getJustOneGuessingHints", () => {
  it("returns remaining hints in join order after duplicate review confirmation", () => {
    const { engine, registry, session } = setupDuplicateReview();
    const excluded = excludeHint({ engine, session, playerId: "player-2" });

    if (excluded.status !== "excluded") {
      throw new Error("Expected hint exclusion to succeed");
    }

    const confirmed = confirmDuplicateReview({ engine, session: excluded.session });

    if (confirmed.status !== "confirmed") {
      throw new Error("Expected duplicate review confirmation to succeed");
    }

    registry.register({ channelId: "channel-1", session: confirmed.session });

    expect(getJustOneGuessingHints({ channelId: "channel-1", registry })).toEqual({
      status: "ready",
      guesserId: "player-1",
      hints: ["Red"]
    });
  });

  it("returns an empty hint list when all hints were removed", () => {
    const { engine, registry, session } = setupDuplicateReview();
    const firstExcluded = excludeHint({ engine, session, playerId: "player-2" });

    if (firstExcluded.status !== "excluded") {
      throw new Error("Expected first hint exclusion to succeed");
    }

    const secondExcluded = excludeHint({
      engine,
      session: firstExcluded.session,
      playerId: "player-3"
    });

    if (secondExcluded.status !== "excluded") {
      throw new Error("Expected second hint exclusion to succeed");
    }

    const confirmed = confirmDuplicateReview({ engine, session: secondExcluded.session });

    if (confirmed.status !== "confirmed") {
      throw new Error("Expected duplicate review confirmation to succeed");
    }

    registry.register({ channelId: "channel-1", session: confirmed.session });

    expect(getJustOneGuessingHints({ channelId: "channel-1", registry })).toEqual({
      status: "ready",
      guesserId: "player-1",
      hints: []
    });
  });

  it("does not expose hints outside the guessing phase", () => {
    const { registry } = setupDuplicateReview();

    expect(getJustOneGuessingHints({ channelId: "channel-1", registry })).toEqual({
      status: "invalidState"
    });
    expect(getJustOneGuessingHints({ channelId: "missing-channel", registry })).toEqual({
      status: "notFound"
    });
  });

  it("keeps the Engine remaining hints unchanged", () => {
    const { engine, registry, session } = setupDuplicateReview("Apple pie");
    const confirmed = confirmDuplicateReview({ engine, session });

    if (confirmed.status !== "confirmed") {
      throw new Error("Expected duplicate review confirmation to succeed");
    }

    registry.register({ channelId: "channel-1", session: confirmed.session });

    expect(getJustOneGuessingHints({ channelId: "channel-1", registry })).toEqual({
      status: "ready",
      guesserId: "player-1",
      hints: ["Apple pie", "Red"]
    });
  });

  it("publishes the confirmed hints exactly once through the adapter boundary", async () => {
    const { engine, registry, session } = setupDuplicateReview();
    const confirmed = confirmDuplicateReview({ engine, session });

    if (confirmed.status !== "confirmed") {
      throw new Error("Expected duplicate review confirmation to succeed");
    }

    registry.register({ channelId: "channel-1", session: confirmed.session });
    const published: { content: string; guesserId: string }[] = [];

    await expect(
      publishJustOneGuessingHints({
        channelId: "channel-1",
        registry,
        publishMessage: async (message) => {
          published.push(message);
        }
      })
    ).resolves.toEqual({ status: "published" });

    expect(published).toEqual([
      {
        content: expect.stringContaining("Hints for <@player-1>"),
        guesserId: "player-1"
      }
    ]);
    expect(published[0]?.content).toContain("- Fruit");
    expect(published[0]?.content).toContain("- Red");
  });
});

function setupDuplicateReview(firstHintContent = "Fruit") {
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
    hint: firstHintContent
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

  return { engine, registry, session: review.session };
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
