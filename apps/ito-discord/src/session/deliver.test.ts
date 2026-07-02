import { describe, expect, it } from "vitest";

import { createItoEngine } from "@boardgame/game-ito";

import { assignItoDiscordNumbers } from "./assign.js";
import { createItoDiscordSessionForChannel } from "./create.js";
import { deliverItoDiscordNumbers, type ItoNumberDirectMessageInput } from "./deliver.js";
import { joinItoDiscordSessionForChannel } from "./join.js";
import { createItoDiscordSessionRegistry } from "./registry.js";

describe("deliverItoDiscordNumbers", () => {
  it("returns notFound when the channel has no session", async () => {
    const registry = createItoDiscordSessionRegistry();

    const result = await deliverItoDiscordNumbers({
      channelId: "channel-1",
      registry,
      sendDirectMessage: async () => {}
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("returns notAssigned when the channel session has no assigned numbers", async () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const result = await deliverItoDiscordNumbers({
      channelId: "channel-1",
      registry,
      sendDirectMessage: async () => {}
    });

    expect(result).toEqual({ status: "notAssigned" });
  });

  it("sends each assigned number by direct message", async () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    const sentMessages: ItoNumberDirectMessageInput[] = [];
    createAssignedSession(engine, registry);

    const result = await deliverItoDiscordNumbers({
      channelId: "channel-1",
      registry,
      sendDirectMessage: async (message) => {
        sentMessages.push(message);
      }
    });

    expect(result).toEqual({
      status: "delivered",
      succeeded: 2,
      failed: 0
    });
    expect(sentMessages).toHaveLength(2);
    expect(sentMessages.map((message) => message.playerId)).toEqual(["user-1", "user-2"]);
    const deliveredNumbers = sentMessages.map((message) =>
      Number(message.message.replace("Your ITO number is: ", ""))
    );
    expect(new Set(deliveredNumbers).size).toBe(2);
    expect(deliveredNumbers.every((number) => number >= 1 && number <= 100)).toBe(true);
  });

  it("summarizes direct message failures without returning player details", async () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createAssignedSession(engine, registry);

    const result = await deliverItoDiscordNumbers({
      channelId: "channel-1",
      registry,
      sendDirectMessage: async (message) => {
        if (message.playerId === "user-2") {
          throw new Error("DM failed");
        }
      }
    });

    expect(result).toEqual({
      status: "delivered",
      succeeded: 1,
      failed: 1
    });
  });
});

function createAssignedSession(
  engine: ReturnType<typeof createItoEngine>,
  registry: ReturnType<typeof createItoDiscordSessionRegistry>
): void {
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
}
