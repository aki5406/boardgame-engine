import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { createJustOneDiscordSessionForChannel } from "./create.js";
import { deliverJustOneRoles } from "./deliver-roles.js";
import { joinJustOneDiscordSessionForChannel } from "./join.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { startJustOneDiscordSession } from "./start.js";

describe("deliverJustOneRoles", () => {
  it("sends the secret word only to hint players", async () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();
    createJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });
    joinJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });
    joinJustOneDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-2",
      engine,
      registry
    });
    const started = startJustOneDiscordSession({
      channelId: "channel-1",
      engine,
      registry,
      random: createSequenceRandom([0, 0]),
      words: ["Apple"]
    });

    if (started.status !== "started") {
      throw new Error("Expected started session");
    }

    const sentMessages: Array<{ playerId: string; message: string }> = [];

    await deliverJustOneRoles({
      session: started.session,
      sendDirectMessage: async (input) => {
        sentMessages.push(input);
      }
    });

    expect(sentMessages).toHaveLength(2);

    const guesserMessage = sentMessages.find((message) => message.playerId === "user-1");
    const hintPlayerMessage = sentMessages.find((message) => message.playerId === "user-2");

    expect(guesserMessage?.message).toContain("You are the Guesser.");
    expect(guesserMessage?.message).not.toContain("Apple");
    expect(hintPlayerMessage?.message).toContain("You are a Hint Player.");
    expect(hintPlayerMessage?.message).toContain("Apple");
  });
});

function createSequenceRandom(values: readonly number[]): () => number {
  let index = 0;

  return () => {
    const value = values[index];

    if (value === undefined) {
      throw new Error("Missing random value for test");
    }

    index += 1;
    return value;
  };
}
