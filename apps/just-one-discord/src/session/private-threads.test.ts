import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { createJustOneDiscordSessionForChannel } from "./create.js";
import { joinJustOneDiscordSessionForChannel } from "./join.js";
import { createJustOnePrivateHintThreads } from "./private-threads.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { startJustOneDiscordSession } from "./start.js";

describe("createJustOnePrivateHintThreads", () => {
  it("does not create a thread for the guesser", async () => {
    const { result, registry } = createStartedSession();
    const createdPlayerIds: string[] = [];

    if (result.status !== "started") {
      throw new Error("Expected started result");
    }

    const createResult = await createJustOnePrivateHintThreads({
      channelId: "channel-1",
      session: result.session,
      registry,
      createThreadName: ({ playerId }) => `thread-${playerId}`,
      createPrivateHintThread: async ({ playerId, secretWord, threadName }) => {
        createdPlayerIds.push(playerId);
        expect(secretWord).toBe("Apple");
        expect(threadName).toBe(`thread-${playerId}`);

        return {
          threadId: `private-${playerId}`
        };
      }
    });

    expect(createResult).toEqual({
      status: "created",
      createdCount: 2
    });
    expect(createdPlayerIds).toEqual(["user-2", "user-3"]);
  });

  it("registers each created thread with the player mapping", async () => {
    const { result, registry } = createStartedSession();

    if (result.status !== "started") {
      throw new Error("Expected started result");
    }

    await createJustOnePrivateHintThreads({
      channelId: "channel-1",
      session: result.session,
      registry,
      createThreadName: ({ playerId }) => `thread-${playerId}`,
      createPrivateHintThread: async ({ playerId }) => ({
        threadId: `private-${playerId}`
      })
    });

    expect(registry.listHintThreadsByChannelId("channel-1")).toEqual([
      {
        threadId: "private-user-2",
        sessionId: result.session.id,
        channelId: "channel-1",
        playerId: "user-2"
      },
      {
        threadId: "private-user-3",
        sessionId: result.session.id,
        channelId: "channel-1",
        playerId: "user-3"
      }
    ]);
  });

  it("returns partialFailure when one of the thread creations fails", async () => {
    const { result, registry } = createStartedSession();

    if (result.status !== "started") {
      throw new Error("Expected started result");
    }

    const createResult = await createJustOnePrivateHintThreads({
      channelId: "channel-1",
      session: result.session,
      registry,
      createThreadName: ({ playerId }) => `thread-${playerId}`,
      createPrivateHintThread: async ({ playerId }) => {
        if (playerId === "user-3") {
          throw new Error("failed");
        }

        return {
          threadId: `private-${playerId}`
        };
      }
    });

    expect(createResult).toEqual({
      status: "partialFailure",
      createdCount: 1,
      failedCount: 1
    });
    expect(registry.listHintThreadsByChannelId("channel-1")).toEqual([
      {
        threadId: "private-user-2",
        sessionId: result.session.id,
        channelId: "channel-1",
        playerId: "user-2"
      }
    ]);
  });
});

function createStartedSession() {
  const engine = createJustOneEngine();
  const registry = createJustOneDiscordSessionRegistry();

  createJustOneDiscordSessionForChannel({
    channelId: "channel-1",
    engine,
    registry
  });
  joinJustOneDiscordSessionForChannel({
    channelId: "channel-1",
    playerId: "user-1",
    engine,
    registry
  });
  joinJustOneDiscordSessionForChannel({
    channelId: "channel-1",
    playerId: "user-2",
    engine,
    registry
  });
  joinJustOneDiscordSessionForChannel({
    channelId: "channel-1",
    playerId: "user-3",
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

  return {
    result,
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
