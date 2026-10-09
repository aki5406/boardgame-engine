import { describe, expect, it } from "vitest";

import { createWordWolfEngine, MAX_WORD_WOLF_PLAYERS } from "@boardgame/game-word-wolf";

import { createWordWolfDiscordSessionForChannel } from "./create.js";
import { joinWordWolfDiscordSessionForChannel } from "./join.js";
import { createWordWolfDiscordSessionRegistry } from "./registry.js";

describe("joinWordWolfDiscordSessionForChannel", () => {
  it("rejects joining a missing session", () => {
    const result = joinWordWolfDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine: createWordWolfEngine(),
      registry: createWordWolfDiscordSessionRegistry()
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("joins a player and reports the count", () => {
    const engine = createWordWolfEngine();
    const registry = createWordWolfDiscordSessionRegistry();
    createWordWolfDiscordSessionForChannel({ channelId: "channel-1", engine, registry });

    const result = joinWordWolfDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });

    expect(result).toMatchObject({ status: "joined", playerCount: 1 });
  });

  it("rejects duplicate joins", () => {
    const engine = createWordWolfEngine();
    const registry = createWordWolfDiscordSessionRegistry();
    createWordWolfDiscordSessionForChannel({ channelId: "channel-1", engine, registry });
    joinWordWolfDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });

    expect(
      joinWordWolfDiscordSessionForChannel({
        channelId: "channel-1",
        playerId: "user-1",
        engine,
        registry
      })
    ).toMatchObject({ status: "alreadyJoined" });
  });

  it("reports when the game has reached the player limit", () => {
    const engine = createWordWolfEngine();
    const registry = createWordWolfDiscordSessionRegistry();
    createWordWolfDiscordSessionForChannel({ channelId: "channel-1", engine, registry });

    for (let index = 0; index < MAX_WORD_WOLF_PLAYERS; index += 1) {
      joinWordWolfDiscordSessionForChannel({
        channelId: "channel-1",
        playerId: `user-${index}`,
        engine,
        registry
      });
    }

    expect(
      joinWordWolfDiscordSessionForChannel({
        channelId: "channel-1",
        playerId: "user-overflow",
        engine,
        registry
      })
    ).toMatchObject({ status: "playerLimitReached" });
  });
});
