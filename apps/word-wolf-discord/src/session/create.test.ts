import { describe, expect, it } from "vitest";

import { createWordWolfEngine } from "@boardgame/game-word-wolf";

import { createWordWolfDiscordSessionForChannel } from "./create.js";
import { createWordWolfDiscordSessionRegistry } from "./registry.js";

describe("createWordWolfDiscordSessionForChannel", () => {
  it("creates and registers a Word Wolf session for a channel", () => {
    const engine = createWordWolfEngine();
    const registry = createWordWolfDiscordSessionRegistry();

    const result = createWordWolfDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result.status).toBe("created");
    expect(registry.get("channel-1")).toBe(result.session);
  });

  it("does not overwrite an existing session", () => {
    const engine = createWordWolfEngine();
    const registry = createWordWolfDiscordSessionRegistry();
    const first = createWordWolfDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const second = createWordWolfDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(second).toEqual({ status: "alreadyExists", session: first.session });
  });
});
