import { describe, expect, it } from "vitest";

import { createItoEngine } from "@boardgame/game-ito";

import { assignItoDiscordNumbers } from "./assign.js";
import { createItoDiscordSessionForChannel } from "./create.js";
import { joinItoDiscordSessionForChannel } from "./join.js";
import { getItoNumberDeliveryView } from "./number-delivery.js";
import { createItoDiscordSessionRegistry } from "./registry.js";

describe("getItoNumberDeliveryView", () => {
  it("returns notFound when the channel has no session", () => {
    const registry = createItoDiscordSessionRegistry();

    const result = getItoNumberDeliveryView({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("returns notAssigned when the channel session has no assigned numbers", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = getItoNumberDeliveryView({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({ status: "notAssigned" });
  });

  it("returns private delivery items for assigned numbers", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });
    joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });
    joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-2",
      engine,
      registry
    });
    assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = getItoNumberDeliveryView({
      channelId: "channel-1",
      registry
    });

    expect(result.status).toBe("ready");

    if (result.status !== "ready") {
      throw new Error("Expected delivery view to be ready");
    }

    expect(result.items).toHaveLength(2);
    expect(result.items.map((item) => item.playerId)).toEqual(["user-1", "user-2"]);
    const numbers = result.items.map((item) => item.number);
    expect(new Set(numbers).size).toBe(2);
    expect(numbers.every((number) => number >= 1 && number <= 100)).toBe(true);
  });
});
