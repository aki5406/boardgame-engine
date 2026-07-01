import { describe, expect, it } from "vitest";

import { createItoEngine } from "@boardgame/game-ito";

import { createItoDiscordSessionForChannel } from "./create.js";
import { createItoDiscordSessionRegistry } from "./registry.js";
import { setItoDiscordSessionTheme } from "./theme.js";

describe("setItoDiscordSessionTheme", () => {
  it("returns notFound when the channel has no session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();

    const result = setItoDiscordSessionTheme({
      channelId: "channel-1",
      theme: "Convenience store joy",
      engine,
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("applies the theme selected event and registers the updated session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    const createResult = createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = setItoDiscordSessionTheme({
      channelId: "channel-1",
      theme: " Convenience store joy ",
      engine,
      registry
    });

    expect(result.status).toBe("themeSet");
    if (result.status !== "themeSet") {
      throw new Error("Expected theme to be set");
    }

    expect(result.theme).toBe("Convenience store joy");
    expect(result.session).not.toBe(createResult.session);
    expect(result.session).toEqual({
      ...createResult.session,
      state: {
        ...createResult.session.state,
        phase: "themeSelected",
        theme: "Convenience store joy"
      }
    });
    expect(registry.get("channel-1")).toBe(result.session);
  });
});
