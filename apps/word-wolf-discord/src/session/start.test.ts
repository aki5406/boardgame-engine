import { describe, expect, it } from "vitest";

import { createWordWolfEngine, type WordWolfState } from "@boardgame/game-word-wolf";

import { createWordWolfDiscordSessionForChannel } from "./create.js";
import { joinWordWolfDiscordSessionForChannel } from "./join.js";
import { createWordWolfDiscordSessionRegistry } from "./registry.js";
import { startWordWolfDiscordSession } from "./start.js";

describe("startWordWolfDiscordSession", () => {
  it("rejects a missing session", () => {
    expect(
      startWordWolfDiscordSession({
        channelId: "channel-1",
        engine: createWordWolfEngine(),
        registry: createWordWolfDiscordSessionRegistry(),
        random: () => 0
      })
    ).toEqual({ status: "notFound" });
  });

  it("rejects a session with fewer than three players", () => {
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
      startWordWolfDiscordSession({
        channelId: "channel-1",
        engine,
        registry,
        random: () => 0
      })
    ).toEqual({ status: "notEnoughPlayers" });
  });

  it("passes injected random to the Engine and stores the started session", () => {
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

    expect(result).toMatchObject({ status: "started", playerCount: 3 });
    if (result.status !== "started") {
      return;
    }

    expect(result.session.state as WordWolfState).toMatchObject({
      phase: "discussion",
      minorityPlayerId: "user-1",
      majorityWord: "Coffee",
      minorityWord: "Tea"
    });
    expect(registry.get("channel-1")).toBe(result.session);
  });
});

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
