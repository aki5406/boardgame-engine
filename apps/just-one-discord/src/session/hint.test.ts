import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { createJustOneDiscordSessionForChannel } from "./create.js";
import { submitJustOneHintFromThread } from "./hint.js";
import { joinJustOneDiscordSessionForChannel } from "./join.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { getJustOneState } from "./state.js";
import { startJustOneDiscordSession } from "./start.js";

describe("submitJustOneHintFromThread", () => {
  it("stores a hint from the mapped hint player", () => {
    const { engine, registry } = setupStartedGame();

    registry.registerHintThread({
      threadId: "thread-1",
      sessionId: "just-one:channel-1",
      channelId: "channel-1",
      playerId: "player-2"
    });

    const result = submitJustOneHintFromThread({
      threadId: "thread-1",
      authorId: "player-2",
      authorIsBot: false,
      content: "  red fruit  ",
      engine,
      registry
    });

    expect(result).toEqual({ status: "submitted" });
    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({
      hintsByPlayerId: {
        "player-2": "red fruit"
      }
    });
  });

  it("updates an existing hint when the same player posts again", () => {
    const { engine, registry } = setupStartedGame();

    registry.registerHintThread({
      threadId: "thread-1",
      sessionId: "just-one:channel-1",
      channelId: "channel-1",
      playerId: "player-2"
    });

    submitJustOneHintFromThread({
      threadId: "thread-1",
      authorId: "player-2",
      authorIsBot: false,
      content: "fruit",
      engine,
      registry
    });

    const result = submitJustOneHintFromThread({
      threadId: "thread-1",
      authorId: "player-2",
      authorIsBot: false,
      content: " red ",
      engine,
      registry
    });

    expect(result).toEqual({ status: "updated" });
    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({
      hintsByPlayerId: {
        "player-2": "red"
      }
    });
  });

  it("ignores bot posts", () => {
    const { engine, registry } = setupStartedGame();

    const result = submitJustOneHintFromThread({
      threadId: "thread-1",
      authorId: "player-2",
      authorIsBot: true,
      content: "fruit",
      engine,
      registry
    });

    expect(result).toEqual({ status: "ignored", reason: "botAuthor" });
  });

  it("ignores messages in unregistered threads", () => {
    const { engine, registry } = setupStartedGame();

    const result = submitJustOneHintFromThread({
      threadId: "missing-thread",
      authorId: "player-2",
      authorIsBot: false,
      content: "fruit",
      engine,
      registry
    });

    expect(result).toEqual({ status: "ignored", reason: "unregisteredThread" });
  });

  it("ignores posts from a different player than the mapped hint player", () => {
    const { engine, registry } = setupStartedGame();

    registry.registerHintThread({
      threadId: "thread-1",
      sessionId: "just-one:channel-1",
      channelId: "channel-1",
      playerId: "player-2"
    });

    const result = submitJustOneHintFromThread({
      threadId: "thread-1",
      authorId: "player-3",
      authorIsBot: false,
      content: "fruit",
      engine,
      registry
    });

    expect(result).toEqual({ status: "ignored", reason: "wrongAuthor" });
  });

  it("ignores whitespace-only posts", () => {
    const { engine, registry } = setupStartedGame();

    registry.registerHintThread({
      threadId: "thread-1",
      sessionId: "just-one:channel-1",
      channelId: "channel-1",
      playerId: "player-2"
    });

    const result = submitJustOneHintFromThread({
      threadId: "thread-1",
      authorId: "player-2",
      authorIsBot: false,
      content: "   ",
      engine,
      registry
    });

    expect(result).toEqual({ status: "ignored", reason: "emptyHint" });
  });
});

function setupStartedGame() {
  const engine = createJustOneEngine();
  const registry = createJustOneDiscordSessionRegistry();

  createJustOneDiscordSessionForChannel({
    channelId: "channel-1",
    engine,
    registry
  });
  joinJustOneDiscordSessionForChannel({
    channelId: "channel-1",
    playerId: "player-1",
    engine,
    registry
  });
  joinJustOneDiscordSessionForChannel({
    channelId: "channel-1",
    playerId: "player-2",
    engine,
    registry
  });
  joinJustOneDiscordSessionForChannel({
    channelId: "channel-1",
    playerId: "player-3",
    engine,
    registry
  });

  const started = startJustOneDiscordSession({
    channelId: "channel-1",
    engine,
    registry,
    random: createSequenceRandom([0, 0]),
    words: ["Apple"]
  });

  if (started.status !== "started") {
    throw new Error("Expected Just One game to start");
  }

  return {
    engine,
    registry
  };
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
