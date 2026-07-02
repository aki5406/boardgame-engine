import { describe, expect, it } from "vitest";

import { createItoEngine } from "@boardgame/game-ito";

import { createItoDiscordSessionForChannel } from "./create.js";
import { createItoDiscordSessionRegistry } from "./registry.js";
import { submitItoDiscordOrder } from "./submit.js";

describe("submitItoDiscordOrder", () => {
  it("applies an order submitted event and registers the updated session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = submitItoDiscordOrder({
      channelId: "channel-1",
      engine,
      order: "user-1, user-2,user-3",
      registry
    });

    expect(result.status).toBe("submitted");

    if (result.status !== "submitted") {
      throw new Error("Expected order submission to succeed");
    }

    expect(result.playerCount).toBe(3);
    expect(result.session.state).toMatchObject({
      phase: "orderSubmitted",
      submittedOrder: ["user-1", "user-2", "user-3"]
    });
    expect(registry.get("channel-1")).toBe(result.session);
  });

  it("returns emptyOrder when the submitted order has no player ids", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = submitItoDiscordOrder({
      channelId: "channel-1",
      engine,
      order: " , ",
      registry
    });

    expect(result).toEqual({ status: "emptyOrder" });
  });

  it("returns notFound when no ITO session exists for the channel", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();

    const result = submitItoDiscordOrder({
      channelId: "channel-1",
      engine,
      order: "user-1,user-2",
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });
});
