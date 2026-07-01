import { describe, expect, it } from "vitest";

import { createItoEngine } from "@boardgame/game-ito";

import { assignItoDiscordNumbers } from "./assign.js";
import { createItoDiscordSessionForChannel } from "./create.js";
import { startItoDiscordDiscussion } from "./discuss.js";
import { joinItoDiscordSessionForChannel } from "./join.js";
import { createItoDiscordSessionRegistry } from "./registry.js";
import { setItoDiscordSessionTheme } from "./theme.js";

describe("startItoDiscordDiscussion", () => {
  it("returns notFound when the channel has no session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();

    const result = startItoDiscordDiscussion({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("returns noTheme when the channel session has no theme", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = startItoDiscordDiscussion({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "noTheme" });
  });

  it("returns notAssigned when the channel session has no assigned numbers", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });
    setItoDiscordSessionTheme({
      channelId: "channel-1",
      theme: "Convenience store joy",
      engine,
      registry
    });

    const result = startItoDiscordDiscussion({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "notAssigned" });
  });

  it("applies discussion started event and registers the updated session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });
    setItoDiscordSessionTheme({
      channelId: "channel-1",
      theme: "Convenience store joy",
      engine,
      registry
    });
    joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });
    joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-2",
      engine,
      registry
    });
    const assignResult = assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = startItoDiscordDiscussion({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result.status).toBe("discussionStarted");
    if (result.status !== "discussionStarted" || assignResult.status !== "numbersAssigned") {
      throw new Error("Expected discussion to start after number assignment");
    }

    expect(result.theme).toBe("Convenience store joy");
    expect(result.playerCount).toBe(2);
    expect(result.session).not.toBe(assignResult.session);
    expect(result.session.state).toEqual({
      ...assignResult.session.state,
      phase: "discussion"
    });
    expect(registry.get("channel-1")).toBe(result.session);
  });
});
