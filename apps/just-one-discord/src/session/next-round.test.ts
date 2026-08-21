import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { submitJustOneHintFromThread } from "./hint.js";
import { startNextJustOneDiscordRound } from "./next-round.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";

describe("startNextJustOneDiscordRound", () => {
  it("starts a new round, preserves score, and clears stale round mappings", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();
    const session = engine.startSession({
      id: "just-one:channel-1",
      players: [{ id: "player-1" }, { id: "player-2" }, { id: "player-3" }],
      initialState: {
        phase: "roundScored",
        players: ["player-1", "player-2", "player-3"],
        guesserId: "player-1",
        secretWord: "Apple",
        guess: "Apple",
        result: "correct",
        score: 2,
        hintsByPlayerId: { "player-2": "Fruit", "player-3": "Red" },
        excludedHintPlayerIds: ["player-3"]
      }
    });
    registry.register({ channelId: "channel-1", session });
    registry.registerHintThread({
      threadId: "old-hint-thread",
      sessionId: session.id,
      channelId: "channel-1",
      playerId: "player-2"
    });
    registry.registerHintProgressMessage({
      channelId: "channel-1",
      sessionId: session.id,
      messageId: "old-progress-message"
    });
    registry.registerDuplicateReviewThread({
      threadId: "old-review-thread",
      sessionId: session.id,
      channelId: "channel-1",
      messageId: "old-review-message"
    });
    registry.registerGuessingMessage({
      channelId: "channel-1",
      sessionId: session.id,
      messageId: "old-guessing-message"
    });
    registry.registerRevealMessage({
      channelId: "channel-1",
      sessionId: session.id,
      messageId: "old-reveal-message"
    });

    const result = startNextJustOneDiscordRound({
      channelId: "channel-1",
      engine,
      registry,
      random: () => 0.5,
      words: ["Apple", "Train", "Ocean"]
    });

    expect(result).toMatchObject({
      status: "started",
      guesserId: "player-2",
      hintPlayerCount: 2,
      score: 2
    });
    expect(registry.get("channel-1")?.state).toMatchObject({
      phase: "hinting",
      guesserId: "player-2",
      secretWord: "Train",
      score: 2,
      guess: null,
      result: null,
      hintsByPlayerId: {},
      excludedHintPlayerIds: []
    });
    expect(registry.getHintThread("old-hint-thread")).toBeUndefined();
    expect(registry.getHintProgressMessage("channel-1")).toBeUndefined();
    expect(registry.getDuplicateReviewThread("old-review-thread")).toBeUndefined();
    expect(registry.getGuessingMessage("channel-1")).toBeUndefined();
    expect(registry.getRevealMessage("channel-1")).toBeUndefined();
    expect(
      submitJustOneHintFromThread({
        threadId: "old-hint-thread",
        authorId: "player-2",
        authorIsBot: false,
        content: "stale hint",
        engine,
        registry
      })
    ).toEqual({ status: "ignored", reason: "unregisteredThread" });
  });

  it("does not start the next round twice", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();
    registry.register({
      channelId: "channel-1",
      session: engine.startSession({
        id: "just-one:channel-1",
        players: [{ id: "player-1" }, { id: "player-2" }],
        initialState: {
          phase: "roundScored",
          players: ["player-1", "player-2"],
          guesserId: "player-1",
          secretWord: "Apple",
          guess: "Apple",
          result: "correct",
          score: 1,
          hintsByPlayerId: {},
          excludedHintPlayerIds: []
        }
      })
    });

    expect(
      startNextJustOneDiscordRound({
        channelId: "channel-1",
        engine,
        registry,
        random: () => 0,
        words: ["Train"]
      })
    ).toMatchObject({ status: "started" });
    expect(
      startNextJustOneDiscordRound({
        channelId: "channel-1",
        engine,
        registry,
        random: () => 0,
        words: ["Train"]
      })
    ).toEqual({ status: "invalidPhase" });
  });
});
