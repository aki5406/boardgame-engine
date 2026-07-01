import { describe, expect, it } from "vitest";

import { createItoEngine, itoInitialState } from "@boardgame/game-ito";

import { createItoDiscordSessionForChannel } from "./create.js";
import { createItoDiscordSessionRegistry } from "./registry.js";

describe("createItoDiscordSessionForChannel", () => {
  it("creates and registers an ITO session for a channel", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();

    const result = createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result.status).toBe("created");
    expect(result.session).toEqual({
      id: "ito:channel-1",
      game: engine.game,
      players: [],
      state: itoInitialState
    });
    expect(registry.get("channel-1")).toBe(result.session);
  });

  it("does not overwrite an existing session for a channel", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    const firstResult = createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const secondResult = createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(secondResult.status).toBe("alreadyExists");
    expect(secondResult.session).toBe(firstResult.session);
    expect(registry.get("channel-1")).toBe(firstResult.session);
  });
});
