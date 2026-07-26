import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { createJustOneDiscordSessionForChannel } from "./create.js";
import { submitJustOneHintFromThread } from "./hint.js";
import { updateJustOneHintProgress } from "./hint-progress.js";
import { joinJustOneDiscordSessionForChannel } from "./join.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { startJustOneDiscordSession } from "./start.js";

describe("updateJustOneHintProgress", () => {
  it("updates the registered progress message with the initial progress", async () => {
    const { registry, session } = setupStartedGame();
    registry.registerHintProgressMessage({
      channelId: "channel-1",
      sessionId: session.id,
      messageId: "progress-message-1"
    });
    const edits: { messageId: string; content: string }[] = [];

    const result = await updateJustOneHintProgress({
      channelId: "channel-1",
      registry,
      editProgressMessage: async (edit) => {
        edits.push(edit);
      }
    });

    expect(result).toEqual({ status: "updated" });
    expect(edits).toEqual([
      {
        messageId: "progress-message-1",
        content: "Hint progress: 0 / 2 submitted"
      }
    ]);
  });

  it("updates the same message after a hint is submitted", async () => {
    const { engine, registry, session } = setupStartedGame();
    registry.registerHintProgressMessage({
      channelId: "channel-1",
      sessionId: session.id,
      messageId: "progress-message-1"
    });
    registry.registerHintThread({
      threadId: "thread-player-2",
      sessionId: session.id,
      channelId: "channel-1",
      playerId: "player-2"
    });
    submitJustOneHintFromThread({
      threadId: "thread-player-2",
      authorId: "player-2",
      authorIsBot: false,
      content: "fruit",
      engine,
      registry
    });
    const edits: { messageId: string; content: string }[] = [];

    await updateJustOneHintProgress({
      channelId: "channel-1",
      registry,
      editProgressMessage: async (edit) => {
        edits.push(edit);
      }
    });

    expect(edits).toEqual([
      {
        messageId: "progress-message-1",
        content: "Hint progress: 1 / 2 submitted"
      }
    ]);
  });

  it("keeps the count stable when a player updates a hint", async () => {
    const { engine, registry, session } = setupStartedGame();
    registry.registerHintProgressMessage({
      channelId: "channel-1",
      sessionId: session.id,
      messageId: "progress-message-1"
    });
    registry.registerHintThread({
      threadId: "thread-player-2",
      sessionId: session.id,
      channelId: "channel-1",
      playerId: "player-2"
    });

    for (const content of ["fruit", "red"]) {
      submitJustOneHintFromThread({
        threadId: "thread-player-2",
        authorId: "player-2",
        authorIsBot: false,
        content,
        engine,
        registry
      });
    }

    const edits: { messageId: string; content: string }[] = [];
    await updateJustOneHintProgress({
      channelId: "channel-1",
      registry,
      editProgressMessage: async (edit) => {
        edits.push(edit);
      }
    });

    expect(edits).toEqual([
      {
        messageId: "progress-message-1",
        content: "Hint progress: 1 / 2 submitted"
      }
    ]);
  });

  it("keeps the saved hint when editing the progress message fails", async () => {
    const { engine, registry, session } = setupStartedGame();
    registry.registerHintProgressMessage({
      channelId: "channel-1",
      sessionId: session.id,
      messageId: "progress-message-1"
    });
    registry.registerHintThread({
      threadId: "thread-player-2",
      sessionId: session.id,
      channelId: "channel-1",
      playerId: "player-2"
    });
    const hintResult = submitJustOneHintFromThread({
      threadId: "thread-player-2",
      authorId: "player-2",
      authorIsBot: false,
      content: "fruit",
      engine,
      registry
    });

    expect(hintResult).toEqual({ status: "submitted" });
    await expect(
      updateJustOneHintProgress({
        channelId: "channel-1",
        registry,
        editProgressMessage: async () => {
          throw new Error("message edit failed");
        }
      })
    ).rejects.toThrow("message edit failed");
    expect(registry.get("channel-1")?.state).toMatchObject({
      hintsByPlayerId: {
        "player-2": "fruit"
      }
    });
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

  const result = startJustOneDiscordSession({
    channelId: "channel-1",
    engine,
    registry,
    random: createSequenceRandom([0, 0]),
    words: ["Apple"]
  });

  if (result.status !== "started") {
    throw new Error("Expected Just One game to start");
  }

  return {
    engine,
    registry,
    session: result.session
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
