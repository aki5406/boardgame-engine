import { describe, expect, it } from "vitest";

import { createItoEngine, itoInitialState } from "@boardgame/game-ito";

import { createItoDiscordSessionForChannel } from "./create.js";
import { joinItoDiscordSessionForChannel } from "./join.js";
import { createItoDiscordSessionRegistry } from "./registry.js";

describe("joinItoDiscordSessionForChannel", () => {
  it("returns notFound when the channel has no session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();

    const result = joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("adds a player to an existing channel session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });

    expect(result.status).toBe("joined");
    if (result.status !== "joined") {
      throw new Error("Expected player to join the session");
    }

    expect(result.playerCount).toBe(1);
    expect(result.session).toEqual({
      id: "ito:channel-1",
      game: engine.game,
      players: [{ id: "user-1" }],
      state: itoInitialState
    });
    expect(registry.get("channel-1")).toBe(result.session);
  });

  it("does not add the same player twice", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });
    const firstResult = joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });

    const secondResult = joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });

    expect(secondResult.status).toBe("alreadyJoined");
    if (firstResult.status !== "joined" || secondResult.status !== "alreadyJoined") {
      throw new Error("Expected duplicate join to return the existing session");
    }

    expect(firstResult.playerCount).toBe(1);
    expect(secondResult.session).toBe(firstResult.session);
    expect(secondResult.session.players).toEqual([{ id: "user-1" }]);
    expect(registry.get("channel-1")).toBe(firstResult.session);
  });
});
