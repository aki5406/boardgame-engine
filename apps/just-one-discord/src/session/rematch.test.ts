import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { submitJustOneHintFromThread } from "./hint.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { resetJustOneDiscordSessionForRematch } from "./rematch.js";
import { getJustOneState } from "./state.js";

describe("resetJustOneDiscordSessionForRematch", () => {
  it("resets the session and clears prior round resources", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();
    const session = engine.startSession({
      id: "just-one:channel-1",
      players: [{ id: "player-1" }, { id: "player-2" }],
      initialState: {
        phase: "finished",
        players: ["player-1", "player-2"],
        guesserId: "player-1",
        secretWord: "Apple",
        guess: "Apple",
        result: "correct",
        score: 9,
        roundNumber: 13,
        hintsByPlayerId: { "player-2": "Fruit" },
        excludedHintPlayerIds: []
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

    expect(
      resetJustOneDiscordSessionForRematch({ channelId: "channel-1", engine, registry })
    ).toMatchObject({
      status: "reset"
    });
    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({
      phase: "waiting",
      players: ["player-1", "player-2"],
      score: 0,
      roundNumber: 0
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
});
