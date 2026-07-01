import { describe, expect, it } from "vitest";

import { createItoEngine } from "@boardgame/game-ito";

import { assignItoDiscordNumbers } from "./assign.js";
import { createItoDiscordSessionForChannel } from "./create.js";
import { joinItoDiscordSessionForChannel } from "./join.js";
import { createItoDiscordSessionRegistry } from "./registry.js";

describe("assignItoDiscordNumbers", () => {
  it("returns notFound when the channel has no session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();

    const result = assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
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

    const result = assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "noPlayers" });
  });

  it("applies numbers assigned event and registers the updated session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    const createResult = createItoDiscordSessionForChannel({
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

    const result = assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result.status).toBe("numbersAssigned");
    if (result.status !== "numbersAssigned") {
      throw new Error("Expected numbers to be assigned");
    }

    expect(result.playerCount).toBe(2);
    expect(result.session).not.toBe(createResult.session);
    expect(result.session.state).toEqual({
      ...createResult.session.state,
      phase: "numbersAssigned",
      assignedNumbers: [
        { playerId: "user-1", number: 1 },
        { playerId: "user-2", number: 2 }
      ]
    });
    expect(registry.get("channel-1")).toBe(result.session);
  });
});
