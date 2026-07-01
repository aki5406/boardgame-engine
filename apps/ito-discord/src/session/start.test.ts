import { describe, expect, it } from "vitest";

import { createItoEngine } from "@boardgame/game-ito";

import { createItoDiscordSessionForChannel } from "./create.js";
import { joinItoDiscordSessionForChannel } from "./join.js";
import { createItoDiscordSessionRegistry } from "./registry.js";
import { startItoDiscordSession } from "./start.js";

describe("startItoDiscordSession", () => {
  it("returns notFound when the channel has no session", () => {
    const registry = createItoDiscordSessionRegistry();

    const result = startItoDiscordSession({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("returns noPlayers when the channel session has no players", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = startItoDiscordSession({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({ status: "noPlayers" });
  });

  it("starts a channel session with joined players", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
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

    const result = startItoDiscordSession({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({
      status: "started",
      playerCount: 2
    });
  });
});
