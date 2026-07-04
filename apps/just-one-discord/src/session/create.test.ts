import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { createJustOneDiscordSessionForChannel, justOneInitialState } from "./create.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";

describe("createJustOneDiscordSessionForChannel", () => {
  it("creates and registers a Just One session for a channel", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();

    const result = createJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result.status).toBe("created");
    expect(result.session).toEqual({
      id: "just-one:channel-1",
      game: engine.game,
      players: [],
      state: justOneInitialState
    });
    expect(registry.get("channel-1")).toBe(result.session);
  });

  it("does not overwrite an existing session for a channel", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();
    const firstResult = createJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const secondResult = createJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(secondResult.status).toBe("alreadyExists");
    expect(secondResult.session).toBe(firstResult.session);
  });
});
