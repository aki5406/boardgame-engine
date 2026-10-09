import { EventEmitter } from "node:events";

import { describe, expect, it, vi } from "vitest";

import type { ChatInputCommandInteraction, Client } from "discord.js";

import { createWordWolfEngine } from "@boardgame/game-word-wolf";

import { createWordWolfDiscordSessionRegistry } from "../session/index.js";
import { registerWordWolfInteractionHandlers } from "./word-wolf.js";

describe("Word Wolf interaction routing", () => {
  it("ignores interactions for other commands", async () => {
    const client = new EventEmitter() as unknown as Client;
    const registry = createWordWolfDiscordSessionRegistry();
    const reply = vi.fn();

    registerWordWolfInteractionHandlers(client, {
      engine: createWordWolfEngine(),
      sessionRegistry: registry,
      random: () => 0
    });

    (client as unknown as EventEmitter).emit("interactionCreate", {
      isChatInputCommand: () => true,
      commandName: "other-command",
      reply
    });
    await flushInteraction();

    expect(reply).not.toHaveBeenCalled();
    expect(registry.has("channel-1")).toBe(false);
  });

  it("creates a session for the word-wolf create command", async () => {
    const client = new EventEmitter() as unknown as Client;
    const engine = createWordWolfEngine();
    const registry = createWordWolfDiscordSessionRegistry();
    const reply = vi.fn().mockResolvedValue(undefined);

    registerWordWolfInteractionHandlers(client, {
      engine,
      sessionRegistry: registry,
      random: () => 0
    });

    (client as unknown as EventEmitter).emit(
      "interactionCreate",
      createCommandInteraction("create", reply)
    );
    await flushInteraction();

    expect(reply).toHaveBeenCalledWith("Word Wolf game created for this channel.");
    expect(registry.has("channel-1")).toBe(true);
  });
});

function createCommandInteraction(
  subcommand: string,
  reply: ReturnType<typeof vi.fn>
): ChatInputCommandInteraction {
  return {
    isChatInputCommand: () => true,
    commandName: "word-wolf",
    channelId: "channel-1",
    options: {
      getSubcommand: () => subcommand
    },
    reply
  } as unknown as ChatInputCommandInteraction;
}

async function flushInteraction(): Promise<void> {
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
}
