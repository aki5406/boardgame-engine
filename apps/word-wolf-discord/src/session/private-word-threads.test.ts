import { describe, expect, it } from "vitest";

import { createWordWolfEngine } from "@boardgame/game-word-wolf";

import { createWordWolfDiscordSessionForChannel } from "./create.js";
import { joinWordWolfDiscordSessionForChannel } from "./join.js";
import { createWordWolfPrivateWordThreads } from "./private-word-threads.js";
import { createWordWolfDiscordSessionRegistry } from "./registry.js";
import { startWordWolfDiscordSession } from "./start.js";

describe("createWordWolfPrivateWordThreads", () => {
  it("creates one private word thread per player and maps each thread", async () => {
    const { registry, session } = createStartedSession();
    const deliveredWords = new Map<string, string>();

    const result = await createWordWolfPrivateWordThreads({
      channelId: "channel-1",
      session,
      registry,
      createThreadName: ({ playerId }) => `thread-${playerId}`,
      createPrivateWordThread: async ({ playerId, word, threadName }) => {
        deliveredWords.set(playerId, word);
        expect(threadName).toBe(`thread-${playerId}`);

        return { threadId: `private-${playerId}` };
      }
    });

    expect(result).toEqual({ status: "created", createdCount: 3 });
    expect(deliveredWords).toEqual(
      new Map([
        ["user-1", "Tea"],
        ["user-2", "Coffee"],
        ["user-3", "Coffee"]
      ])
    );
    expect(registry.listPrivateWordThreadsByChannelId("channel-1")).toEqual([
      {
        threadId: "private-user-1",
        sessionId: session.id,
        channelId: "channel-1",
        playerId: "user-1"
      },
      {
        threadId: "private-user-2",
        sessionId: session.id,
        channelId: "channel-1",
        playerId: "user-2"
      },
      {
        threadId: "private-user-3",
        sessionId: session.id,
        channelId: "channel-1",
        playerId: "user-3"
      }
    ]);
  });

  it("keeps successful thread mappings when one delivery fails", async () => {
    const { registry, session } = createStartedSession();

    const result = await createWordWolfPrivateWordThreads({
      channelId: "channel-1",
      session,
      registry,
      createThreadName: ({ playerId }) => `thread-${playerId}`,
      createPrivateWordThread: async ({ playerId }) => {
        if (playerId === "user-2") {
          throw new Error("failed");
        }

        return { threadId: `private-${playerId}` };
      }
    });

    expect(result).toEqual({ status: "partialFailure", createdCount: 2, failedCount: 1 });
    expect(registry.listPrivateWordThreadsByChannelId("channel-1")).toHaveLength(2);
  });
});

function createStartedSession() {
  const engine = createWordWolfEngine();
  const registry = createWordWolfDiscordSessionRegistry();
  createWordWolfDiscordSessionForChannel({ channelId: "channel-1", engine, registry });

  for (const playerId of ["user-1", "user-2", "user-3"]) {
    joinWordWolfDiscordSessionForChannel({
      channelId: "channel-1",
      playerId,
      engine,
      registry
    });
  }

  const result = startWordWolfDiscordSession({
    channelId: "channel-1",
    engine,
    registry,
    random: createSequenceRandom([0, 0, 0]),
    wordPairs: [{ words: ["Coffee", "Tea"] }]
  });

  if (result.status !== "started") {
    throw new Error("Expected started result");
  }

  return { registry, session: result.session };
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
