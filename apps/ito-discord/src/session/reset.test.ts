import { describe, expect, it } from "vitest";

import { createItoEngine } from "@boardgame/game-ito";

import { createItoDiscordSessionForChannel } from "./create.js";
import { createItoDiscordSessionRegistry } from "./registry.js";
import { resetItoDiscordSessionForChannel } from "./reset.js";

describe("resetItoDiscordSessionForChannel", () => {
  it("deletes an existing ITO session for a channel", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = resetItoDiscordSessionForChannel({
      channelId: "channel-1",
      registry
    });

    expect(result.status).toBe("reset");
    expect(registry.has("channel-1")).toBe(false);
  });

  it("returns notFound when no ITO session exists for the channel", () => {
    const registry = createItoDiscordSessionRegistry();

    const result = resetItoDiscordSessionForChannel({
      channelId: "channel-1",
      registry
    });

    expect(result.status).toBe("notFound");
  });
});
