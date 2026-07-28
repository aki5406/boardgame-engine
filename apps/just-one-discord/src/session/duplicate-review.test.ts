import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { createJustOneDiscordSessionForChannel } from "./create.js";
import {
  createJustOneDuplicateReviewThread,
  startJustOneDuplicateReviewForChannel
} from "./duplicate-review.js";
import { submitJustOneHintFromThread } from "./hint.js";
import { joinJustOneDiscordSessionForChannel } from "./join.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { startJustOneDiscordSession } from "./start.js";
import { getJustOneState } from "./state.js";

describe("startJustOneDuplicateReviewForChannel", () => {
  it("does not start before every hint player has submitted", () => {
    const { engine, registry, session } = setupStartedGame();
    registerHintThread(registry, session.id, "thread-player-2", "player-2");
    submitHint(engine, registry, "thread-player-2", "player-2", "fruit");

    expect(
      startJustOneDuplicateReviewForChannel({
        channelId: "channel-1",
        engine,
        registry
      })
    ).toEqual({ status: "notReady" });
  });

  it("starts after every hint player has submitted", () => {
    const { engine, registry, session } = setupStartedGame();
    registerHintThread(registry, session.id, "thread-player-2", "player-2");
    registerHintThread(registry, session.id, "thread-player-3", "player-3");
    submitHint(engine, registry, "thread-player-2", "player-2", "fruit");
    submitHint(engine, registry, "thread-player-3", "player-3", "red");

    const result = startJustOneDuplicateReviewForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result.status).toBe("started");
    expect(getJustOneState(registry.get("channel-1")!).phase).toBe("duplicateReview");
  });
});

describe("createJustOneDuplicateReviewThread", () => {
  it("creates one private thread for every hint player and registers it", async () => {
    const { registry, session } = setupReadyDuplicateReview();
    const createdInputs: {
      threadName: string;
      hintPlayerIds: readonly string[];
    }[] = [];

    const result = await createJustOneDuplicateReviewThread({
      channelId: "channel-1",
      session,
      registry,
      threadName: "just-one-duplicate-review",
      createPrivateThread: async (input) => {
        createdInputs.push(input);
        return { threadId: "duplicate-thread-1", messageId: "review-message-1" };
      }
    });

    expect(result).toEqual({ status: "created", threadId: "duplicate-thread-1" });
    expect(createdInputs).toEqual([
      {
        threadName: "just-one-duplicate-review",
        hintPlayerIds: ["player-2", "player-3"]
      }
    ]);
    expect(registry.getDuplicateReviewThread("duplicate-thread-1")).toEqual({
      threadId: "duplicate-thread-1",
      sessionId: session.id,
      channelId: "channel-1",
      messageId: "review-message-1"
    });
  });

  it("does not create a second duplicate review thread", async () => {
    const { registry, session } = setupReadyDuplicateReview();
    registry.registerDuplicateReviewThread({
      threadId: "duplicate-thread-1",
      sessionId: session.id,
      channelId: "channel-1",
      messageId: "review-message-1"
    });

    const result = await createJustOneDuplicateReviewThread({
      channelId: "channel-1",
      session,
      registry,
      threadName: "just-one-duplicate-review",
      createPrivateThread: async () => {
        throw new Error("A second thread must not be created");
      }
    });

    expect(result).toEqual({ status: "alreadyExists", threadId: "duplicate-thread-1" });
  });

  it("does not register a thread when creation fails", async () => {
    const { registry, session } = setupReadyDuplicateReview();

    await expect(
      createJustOneDuplicateReviewThread({
        channelId: "channel-1",
        session,
        registry,
        threadName: "just-one-duplicate-review",
        createPrivateThread: async () => {
          throw new Error("thread creation failed");
        }
      })
    ).rejects.toThrow("thread creation failed");
    expect(registry.getDuplicateReviewThreadByChannelId("channel-1")).toBeUndefined();
    expect(getJustOneState(registry.get("channel-1")!).phase).toBe("duplicateReview");
  });
});

function setupReadyDuplicateReview() {
  const { engine, registry, session } = setupStartedGame();
  registerHintThread(registry, session.id, "thread-player-2", "player-2");
  registerHintThread(registry, session.id, "thread-player-3", "player-3");
  submitHint(engine, registry, "thread-player-2", "player-2", "Fruit");
  submitHint(engine, registry, "thread-player-3", "player-3", "Red");
  const started = startJustOneDuplicateReviewForChannel({
    channelId: "channel-1",
    engine,
    registry
  });

  if (started.status !== "started") {
    throw new Error("Expected duplicate review to start");
  }

  return {
    engine,
    registry,
    session: started.session
  };
}

function setupStartedGame() {
  const engine = createJustOneEngine();
  const registry = createJustOneDiscordSessionRegistry();

  createJustOneDiscordSessionForChannel({
    channelId: "channel-1",
    engine,
    registry
  });
  for (const playerId of ["player-1", "player-2", "player-3"]) {
    joinJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      playerId,
      engine,
      registry
    });
  }

  const started = startJustOneDiscordSession({
    channelId: "channel-1",
    engine,
    registry,
    random: createSequenceRandom([0, 0]),
    words: ["Apple"]
  });

  if (started.status !== "started") {
    throw new Error("Expected Just One to start");
  }

  return {
    engine,
    registry,
    session: started.session
  };
}

function registerHintThread(
  registry: ReturnType<typeof createJustOneDiscordSessionRegistry>,
  sessionId: string,
  threadId: string,
  playerId: string
): void {
  registry.registerHintThread({
    threadId,
    sessionId,
    channelId: "channel-1",
    playerId
  });
}

function submitHint(
  engine: ReturnType<typeof createJustOneEngine>,
  registry: ReturnType<typeof createJustOneDiscordSessionRegistry>,
  threadId: string,
  playerId: string,
  content: string
): void {
  const result = submitJustOneHintFromThread({
    threadId,
    authorId: playerId,
    authorIsBot: false,
    content,
    engine,
    registry
  });

  if (result.status !== "submitted") {
    throw new Error("Expected hint submission to succeed");
  }
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
