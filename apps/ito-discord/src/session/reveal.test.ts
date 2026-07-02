import { describe, expect, it } from "vitest";

import { createItoEngine } from "@boardgame/game-ito";

import { assignItoDiscordNumbers } from "./assign.js";
import { createItoDiscordSessionForChannel } from "./create.js";
import { joinItoDiscordSessionForChannel } from "./join.js";
import { createItoDiscordSessionRegistry } from "./registry.js";
import { revealItoDiscordResult } from "./reveal.js";
import { submitItoDiscordOrder } from "./submit.js";

describe("revealItoDiscordResult", () => {
  it("reveals the submitted order when it exists", () => {
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
    joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-3",
      engine,
      registry
    });
    assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
      registry
    });
    submitItoDiscordOrder({
      channelId: "channel-1",
      engine,
      order: "user-1,user-2,user-3",
      registry
    });

    const result = revealItoDiscordResult({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result.status).toBe("revealed");

    if (result.status !== "revealed") {
      throw new Error("Expected reveal to succeed");
    }

    expect(result.items.map((item) => item.playerId)).toEqual(["user-1", "user-2", "user-3"]);
    const numbers = result.items.map((item) => item.number);
    expect(new Set(numbers).size).toBe(3);
    expect(
      numbers.every((number) => typeof number === "number" && number >= 1 && number <= 100)
    ).toBe(true);
    expect(result.session.state).toMatchObject({
      phase: "orderSubmitted",
      submittedOrder: ["user-1", "user-2", "user-3"]
    });
  });

  it("reveals all assigned numbers even when no order has been submitted", () => {
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

    const result = revealItoDiscordResult({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result.status).toBe("revealed");

    if (result.status !== "revealed") {
      throw new Error("Expected reveal to succeed");
    }

    expect(result.items.map((item) => item.playerId)).toEqual(["user-1", "user-2"]);
    const numbers = result.items.map((item) => item.number);
    expect(new Set(numbers).size).toBe(2);
    expect(
      numbers.every((number) => typeof number === "number" && number >= 1 && number <= 100)
    ).toBe(true);
    expect(result.session.state).toMatchObject({
      phase: "numbersAssigned"
    });
  });

  it("returns notAssigned when no numbers have been assigned", () => {
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

    const result = revealItoDiscordResult({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "notAssigned" });
  });

  it("returns notFound when no ITO session exists for the channel", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();

    const result = revealItoDiscordResult({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });
});
