import { describe, expect, it } from "vitest";

import { createItoEngine, type ItoAssignedNumber } from "@boardgame/game-ito";

import { assignItoDiscordNumbers } from "./assign.js";
import { createItoDiscordSessionForChannel } from "./create.js";
import { joinItoDiscordSessionForChannel } from "./join.js";
import { createItoDiscordSessionRegistry } from "./registry.js";

describe("assignItoDiscordNumbers", () => {
  it("returns notFound when the channel has no session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();

    const result = assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("returns noPlayers when the channel session has no players", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result).toEqual({ status: "noPlayers" });
  });

  it("applies numbers assigned event and registers the updated session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    const createResult = createItoDiscordSessionForChannel({
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

    const result = assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result.status).toBe("numbersAssigned");
    if (result.status !== "numbersAssigned") {
      throw new Error("Expected numbers to be assigned");
    }

    expect(result.playerCount).toBe(2);
    expect(result.session).not.toBe(createResult.session);
    expect(result.session.state).toMatchObject({
      ...createResult.session.state,
      phase: "numbersAssigned"
    });
    const assignedNumbers = result.session.state.assignedNumbers as
      | readonly ItoAssignedNumber[]
      | undefined;
    expect(assignedNumbers).toBeDefined();
    expect(assignedNumbers).toHaveLength(2);
    expect(assignedNumbers?.map((assignment) => assignment.playerId)).toEqual(["user-1", "user-2"]);
    const numbers: number[] = assignedNumbers?.map((assignment) => assignment.number) ?? [];
    expect(numbers).toHaveLength(2);
    expect(new Set(numbers).size).toBe(2);
    expect(numbers.every((number) => number >= 1 && number <= 100)).toBe(true);
    expect(registry.get("channel-1")).toBe(result.session);
  });

  it("assigns one unique number per player within 1 to 100", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    for (const playerId of ["user-1", "user-2", "user-3", "user-4"]) {
      joinItoDiscordSessionForChannel({
        channelId: "channel-1",
        playerId,
        engine,
        registry
      });
    }

    const result = assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
      registry
    });

    expect(result.status).toBe("numbersAssigned");

    if (result.status !== "numbersAssigned") {
      throw new Error("Expected numbers to be assigned");
    }

    const assignedNumbers = result.session.state.assignedNumbers as
      | readonly ItoAssignedNumber[]
      | undefined;
    const numbers: number[] = assignedNumbers?.map((assignment) => assignment.number) ?? [];
    expect(numbers).toHaveLength(4);
    expect(new Set(numbers).size).toBe(4);
    expect(numbers.every((number) => number >= 1 && number <= 100)).toBe(true);
  });
});
