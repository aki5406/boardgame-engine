import { EventEmitter } from "node:events";

import { describe, expect, it, vi } from "vitest";

import { ChannelType, type ChatInputCommandInteraction, type Client } from "discord.js";

import { createWordWolfEngine } from "@boardgame/game-word-wolf";

import {
  createWordWolfDiscordSessionForChannel,
  createWordWolfDiscordSessionRegistry,
  joinWordWolfDiscordSessionForChannel
} from "../session/index.js";
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

  it("defers start before private delivery and edits the public result afterward", async () => {
    const client = new EventEmitter() as unknown as Client;
    const engine = createWordWolfEngine();
    const registry = createWordWolfDiscordSessionRegistry();
    const deferReply = vi.fn().mockResolvedValue(undefined);
    const editReply = vi.fn().mockResolvedValue(undefined);
    const createThread = vi.fn();
    const sendPrivateMessage = vi.fn().mockResolvedValue(undefined);
    let threadNumber = 0;

    createThread.mockImplementation(async () => {
      threadNumber += 1;

      return {
        id: `thread-${threadNumber}`,
        members: { add: vi.fn().mockResolvedValue(undefined) },
        send: sendPrivateMessage
      };
    });
    createWordWolfDiscordSessionForChannel({ channelId: "channel-1", engine, registry });

    for (const playerId of ["user-1", "user-2", "user-3"]) {
      joinWordWolfDiscordSessionForChannel({
        channelId: "channel-1",
        playerId,
        engine,
        registry
      });
    }

    registerWordWolfInteractionHandlers(client, {
      engine,
      sessionRegistry: registry,
      random: () => 0
    });

    (client as unknown as EventEmitter).emit(
      "interactionCreate",
      createStartCommandInteraction({ deferReply, editReply, createThread })
    );
    await flushInteraction();

    expect(deferReply).toHaveBeenCalledOnce();
    expect(createThread).toHaveBeenCalledTimes(3);
    expect(sendPrivateMessage).toHaveBeenCalledTimes(3);
    expect(editReply).toHaveBeenCalledWith(
      expect.stringContaining("Check your private thread for your word")
    );
    expect(editReply).not.toHaveBeenCalledWith(expect.stringContaining("Dog"));
    expect(editReply).not.toHaveBeenCalledWith(expect.stringContaining("Cat"));
    const deferCall = getOnlyCallOrder(deferReply);
    const firstThreadCreation = createThread.mock.invocationCallOrder[0];
    const lastPrivateMessage = sendPrivateMessage.mock.invocationCallOrder.at(-1);
    const editCall = getOnlyCallOrder(editReply);

    if (firstThreadCreation === undefined || lastPrivateMessage === undefined) {
      throw new Error("Expected private delivery calls");
    }

    expect(deferCall).toBeLessThan(firstThreadCreation);
    expect(editCall).toBeGreaterThan(lastPrivateMessage);
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

function createStartCommandInteraction(input: {
  readonly deferReply: ReturnType<typeof vi.fn>;
  readonly editReply: ReturnType<typeof vi.fn>;
  readonly createThread: ReturnType<typeof vi.fn>;
}): ChatInputCommandInteraction {
  return {
    isChatInputCommand: () => true,
    commandName: "word-wolf",
    channelId: "channel-1",
    channel: {
      type: ChannelType.GuildText,
      threads: { create: input.createThread }
    },
    options: {
      getSubcommand: () => "start"
    },
    deferReply: input.deferReply,
    editReply: input.editReply
  } as unknown as ChatInputCommandInteraction;
}

async function flushInteraction(): Promise<void> {
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
}

function getOnlyCallOrder(mock: ReturnType<typeof vi.fn>): number {
  const callOrder = mock.mock.invocationCallOrder[0];

  if (callOrder === undefined) {
    throw new Error("Expected one interaction call");
  }

  return callOrder;
}
