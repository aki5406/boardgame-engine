import { EventEmitter } from "node:events";

import { describe, expect, it, vi } from "vitest";

import {
  ChannelType,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type Client
} from "discord.js";

import { createWordWolfEngine, type WordWolfState } from "@boardgame/game-word-wolf";

import {
  createWordWolfDiscordSessionForChannel,
  createWordWolfDiscordSessionRegistry,
  joinWordWolfDiscordSessionForChannel,
  startWordWolfDiscordSession,
  startWordWolfVoting
} from "../session/index.js";
import { WORD_WOLF_START_VOTING_CUSTOM_ID } from "../views/word-wolf-start.js";
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
    const startReply = getOnlyCallArgument(editReply);

    if (!isComponentReply(startReply)) {
      throw new Error("Expected a component reply");
    }

    expect(startReply.content).toContain("Check your private thread for your word");
    expect(startReply.content).not.toContain("Dog");
    expect(startReply.content).not.toContain("Cat");
    expect(startReply.components).toHaveLength(1);
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

  it("starts voting when a participant presses Start voting", async () => {
    const client = new EventEmitter() as unknown as Client;
    const { engine, registry } = createDiscussionSession();
    const update = vi.fn().mockResolvedValue(undefined);
    const reply = vi.fn();

    registerWordWolfInteractionHandlers(client, {
      engine,
      sessionRegistry: registry,
      random: () => 0
    });

    (client as unknown as EventEmitter).emit(
      "interactionCreate",
      createStartVotingButtonInteraction({ userId: "user-2", update, reply })
    );
    await flushInteraction();

    expect((registry.get("channel-1")?.state as WordWolfState).phase).toBe("voting");
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("Votes stay hidden until reveal."),
        components: []
      })
    );
    expect(reply).not.toHaveBeenCalled();
  });

  it("rejects a non-participant from starting voting", async () => {
    const client = new EventEmitter() as unknown as Client;
    const { engine, registry } = createDiscussionSession();
    const update = vi.fn();
    const reply = vi.fn().mockResolvedValue(undefined);

    registerWordWolfInteractionHandlers(client, {
      engine,
      sessionRegistry: registry,
      random: () => 0
    });

    (client as unknown as EventEmitter).emit(
      "interactionCreate",
      createStartVotingButtonInteraction({ userId: "not-a-player", update, reply })
    );
    await flushInteraction();

    expect(reply).toHaveBeenCalledWith({
      content: "Only players in this Word Wolf game can start voting.",
      ephemeral: true
    });
    expect(update).not.toHaveBeenCalled();
    expect((registry.get("channel-1")?.state as WordWolfState).phase).toBe("discussion");
  });

  it("rejects an old Start voting button after voting has begun", async () => {
    const client = new EventEmitter() as unknown as Client;
    const { engine, registry } = createDiscussionSession();
    const update = vi.fn();
    const reply = vi.fn().mockResolvedValue(undefined);
    startWordWolfVoting({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });

    registerWordWolfInteractionHandlers(client, {
      engine,
      sessionRegistry: registry,
      random: () => 0
    });

    (client as unknown as EventEmitter).emit(
      "interactionCreate",
      createStartVotingButtonInteraction({ userId: "user-2", update, reply })
    );
    await flushInteraction();

    expect(reply).toHaveBeenCalledWith({
      content: "Voting has already started.",
      ephemeral: true
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("ignores buttons from other games", async () => {
    const client = new EventEmitter() as unknown as Client;
    const reply = vi.fn();
    const update = vi.fn();

    registerWordWolfInteractionHandlers(client, {
      engine: createWordWolfEngine(),
      sessionRegistry: createWordWolfDiscordSessionRegistry(),
      random: () => 0
    });

    (client as unknown as EventEmitter).emit("interactionCreate", {
      isChatInputCommand: () => false,
      isButton: () => true,
      customId: "ito:reveal",
      reply,
      update
    });
    await flushInteraction();

    expect(reply).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
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

function createStartVotingButtonInteraction(input: {
  readonly userId: string;
  readonly update: ReturnType<typeof vi.fn>;
  readonly reply: ReturnType<typeof vi.fn>;
}): ButtonInteraction {
  return {
    isChatInputCommand: () => false,
    isButton: () => true,
    customId: WORD_WOLF_START_VOTING_CUSTOM_ID,
    channelId: "channel-1",
    user: { id: input.userId },
    update: input.update,
    reply: input.reply
  } as unknown as ButtonInteraction;
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

function getOnlyCallArgument(mock: ReturnType<typeof vi.fn>): unknown {
  const call = mock.mock.calls[0];
  const argument = call?.[0];

  if (argument === undefined) {
    throw new Error("Expected one interaction argument");
  }

  return argument;
}

function isComponentReply(
  value: unknown
): value is Readonly<{ content: string; components: readonly unknown[] }> {
  return (
    typeof value === "object" &&
    value !== null &&
    "content" in value &&
    typeof value.content === "string" &&
    "components" in value &&
    Array.isArray(value.components)
  );
}

function createDiscussionSession() {
  const engine = createWordWolfEngine();
  const registry = createWordWolfDiscordSessionRegistry();
  createWordWolfDiscordSessionForChannel({ channelId: "channel-1", engine, registry });

  for (const playerId of ["user-1", "user-2", "user-3"]) {
    joinWordWolfDiscordSessionForChannel({
      channelId: "channel-1",
      playerId,
      engine,
      registry
    });
  }

  const result = startWordWolfDiscordSession({
    channelId: "channel-1",
    engine,
    registry,
    random: () => 0,
    wordPairs: [{ words: ["Dog", "Cat"] }]
  });

  if (result.status !== "started") {
    throw new Error("Expected a discussion session");
  }

  return { engine, registry };
}
