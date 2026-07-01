import { describe, expect, it } from "vitest";

import { createItoEngine, itoInitialState } from "@boardgame/game-ito";

import { createItoDiscordSessionRegistry } from "./registry.js";

const engine = createItoEngine();
const session = engine.startSession({
  id: "session-1",
  players: [],
  initialState: itoInitialState
});

describe("createItoDiscordSessionRegistry", () => {
  it("registers and retrieves a session by channel id", () => {
    const registry = createItoDiscordSessionRegistry();

    registry.register({
      channelId: "channel-1",
      session
    });

    expect(registry.has("channel-1")).toBe(true);
    expect(registry.get("channel-1")).toBe(session);
  });

  it("deletes a session by channel id", () => {
    const registry = createItoDiscordSessionRegistry();

    registry.register({
      channelId: "channel-1",
      session
    });

    expect(registry.delete("channel-1")).toBe(true);
    expect(registry.has("channel-1")).toBe(false);
    expect(registry.get("channel-1")).toBeUndefined();
  });
});
