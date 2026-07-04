import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { createJustOneDiscordSessionForChannel } from "./create.js";
import { joinJustOneDiscordSessionForChannel } from "./join.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";

describe("joinJustOneDiscordSessionForChannel", () => {
  it("returns notFound when the channel has no session", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();

    const result = joinJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("joins a player into the channel session", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();
    createJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = joinJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });

    expect(result.status).toBe("joined");

    if (result.status !== "joined") {
      throw new Error("Expected joined result");
    }

    expect(result.playerCount).toBe(1);
    expect(result.session.players).toEqual([{ id: "user-1" }]);
  });

  it("does not add the same player twice", () => {
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

    const result = joinJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });

    expect(result.status).toBe("alreadyJoined");
  });
});
