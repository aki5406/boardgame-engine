import { describe, expect, it } from "vitest";

import { createItoEngine, itoInitialState } from "@boardgame/game-ito";

import { createItoDiscordSessionRegistry } from "./registry.js";

const engine = createItoEngine();
const session = engine.startSession({
  id: "session-1",
  players: [],
  initialState: itoInitialState
});

describe("createItoDiscordSessionRegistry", () => {
  it("registers and retrieves a session by channel id", () => {
    const registry = createItoDiscordSessionRegistry();

    registry.register({
      channelId: "channel-1",
      session
    });

    expect(registry.has("channel-1")).toBe(true);
    expect(registry.get("channel-1")).toBe(session);
  });

  it("stores and updates answer tracking state", () => {
    const registry = createItoDiscordSessionRegistry();

    registry.register({
      channelId: "channel-1",
      session
    });

    registry.setAnswerTracking({
      channelId: "channel-1",
      answerTracking: {
        answerThreadId: "thread-1",
        answerStatusMessageId: "message-1",
        answeredPlayerIds: [],
        answersByPlayerId: {}
      }
    });

    expect(registry.findChannelIdByAnswerThreadId("thread-1")).toBe("channel-1");
    expect(registry.getAnswerTracking("channel-1")).toEqual({
      answerThreadId: "thread-1",
      answerStatusMessageId: "message-1",
      answeredPlayerIds: [],
      answersByPlayerId: {}
    });

    expect(
      registry.recordPlayerAnswer({
        channelId: "channel-1",
        playerId: "player-1",
        answer: "first answer"
      })
    ).toBe(true);
    expect(
      registry.recordPlayerAnswer({
        channelId: "channel-1",
        playerId: "player-1",
        answer: "latest answer"
      })
    ).toBe(false);

    expect(registry.getAnswerTracking("channel-1")).toEqual({
      answerThreadId: "thread-1",
      answerStatusMessageId: "message-1",
      answeredPlayerIds: ["player-1"],
      answersByPlayerId: {
        "player-1": "latest answer"
      }
    });
  });

  it("deletes a session by channel id", () => {
    const registry = createItoDiscordSessionRegistry();

    registry.register({
      channelId: "channel-1",
      session
    });

    registry.setAnswerTracking({
      channelId: "channel-1",
      answerTracking: {
        answerThreadId: "thread-1",
        answerStatusMessageId: "message-1",
        answeredPlayerIds: [],
        answersByPlayerId: {}
      }
    });

    expect(registry.delete("channel-1")).toBe(true);
    expect(registry.has("channel-1")).toBe(false);
    expect(registry.get("channel-1")).toBeUndefined();
    expect(registry.getAnswerTracking("channel-1")).toBeUndefined();
    expect(registry.findChannelIdByAnswerThreadId("thread-1")).toBeUndefined();
  });
});
