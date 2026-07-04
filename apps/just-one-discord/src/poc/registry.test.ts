import { describe, expect, it } from "vitest";

import { createJustOnePrivateThreadPocRegistry } from "./registry.js";

describe("createJustOnePrivateThreadPocRegistry", () => {
  it("tracks a created private thread", () => {
    const registry = createJustOnePrivateThreadPocRegistry();

    registry.track({
      threadId: "thread-1",
      parentChannelId: "channel-1",
      invitedPlayerId: "user-1",
      secretWord: "Apple"
    });

    expect(registry.get("thread-1")).toEqual({
      parentChannelId: "channel-1",
      invitedPlayerId: "user-1",
      secretWord: "Apple",
      replies: []
    });
  });

  it("records reply metadata for a tracked thread", () => {
    const registry = createJustOnePrivateThreadPocRegistry();

    registry.track({
      threadId: "thread-1",
      parentChannelId: "channel-1",
      invitedPlayerId: "user-1",
      secretWord: "Apple"
    });

    const didRecord = registry.recordReply({
      threadId: "thread-1",
      content: "hint text",
      authorId: "user-1"
    });

    expect(didRecord).toBe(true);
    expect(registry.get("thread-1")?.replies).toEqual([
      {
        content: "hint text",
        authorId: "user-1",
        threadId: "thread-1"
      }
    ]);
  });

  it("ignores replies for unknown threads", () => {
    const registry = createJustOnePrivateThreadPocRegistry();

    const didRecord = registry.recordReply({
      threadId: "thread-unknown",
      content: "hint text",
      authorId: "user-1"
    });

    expect(didRecord).toBe(false);
  });
});
