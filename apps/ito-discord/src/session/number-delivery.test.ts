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

    expect(result).toEqual({
      status: "ready",
      items: [
        { playerId: "user-1", number: 1 },
        { playerId: "user-2", number: 2 }
      ]
    });
  });
});
