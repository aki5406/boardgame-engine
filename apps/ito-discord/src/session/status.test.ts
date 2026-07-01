import { describe, expect, it } from "vitest";

import { createItoEngine } from "@boardgame/game-ito";

import { createItoDiscordSessionForChannel } from "./create.js";
import { joinItoDiscordSessionForChannel } from "./join.js";
import { createItoDiscordSessionRegistry } from "./registry.js";
import { getItoDiscordSessionStatus } from "./status.js";

describe("getItoDiscordSessionStatus", () => {
  it("returns notFound when the channel has no session", () => {
    const registry = createItoDiscordSessionRegistry();

    const result = getItoDiscordSessionStatus({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("returns session id and player count for an existing channel session", () => {
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

    const result = getItoDiscordSessionStatus({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({
      status: "found",
      sessionId: "ito:channel-1",
      playerCount: 2
    });
  });
});
