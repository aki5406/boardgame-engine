import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { createJustOneDiscordSessionForChannel } from "./create.js";
import { joinJustOneDiscordSessionForChannel } from "./join.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { getJustOneState } from "./state.js";
import { startJustOneDiscordSession } from "./start.js";

describe("startJustOneDiscordSession", () => {
  it("returns notFound when the channel has no session", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();

    const result = startJustOneDiscordSession({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("returns noPlayers when the channel session has no players", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();
    createJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = startJustOneDiscordSession({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "noPlayers" });
  });

  it("starts the game in hinting phase and stores guesser and secret word", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();
    createJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });
    joinJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });
    joinJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-2",
      engine,
      registry
    });

    const result = startJustOneDiscordSession({
      channelId: "channel-1",
      engine,
      registry,
      random: createSequenceRandom([0, 0.5]),
      words: ["Apple", "Train", "Ocean"]
    });

    expect(result.status).toBe("started");

    if (result.status !== "started") {
      throw new Error("Expected started result");
    }

    expect(result).toEqual({
      status: "started",
      guesserId: "user-1",
      hintPlayerCount: 1,
      playerCount: 2,
      secretWord: "Train",
      session: result.session
    });
    expect(getJustOneState(result.session)).toEqual({
      phase: "hinting",
      players: ["user-1", "user-2"],
      guesserId: "user-1",
      secretWord: "Train"
    });
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
