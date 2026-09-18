import { Events } from "discord.js";
import { describe, expect, it, vi } from "vitest";

import { createBoardgameDiscordClient } from "./client.js";
import { registerBoardgameDiscordAdapters } from "./composition.js";

describe("registerBoardgameDiscordAdapters", () => {
  it("registers independent game adapters on one client", () => {
    const client = createBoardgameDiscordClient();
    const adapters = registerBoardgameDiscordAdapters(client);

    expect(client.listenerCount(Events.InteractionCreate)).toBe(2);
    expect(client.listenerCount(Events.MessageCreate)).toBe(2);
    expect(adapters.ito.engine).not.toBe(adapters.justOne.engine);
    expect(adapters.ito.sessionRegistry).not.toBe(adapters.justOne.sessionRegistry);

    client.destroy();
  });

  it("routes an ITO command without handling it as Just One", async () => {
    const client = createBoardgameDiscordClient();
    registerBoardgameDiscordAdapters(client);
    const interaction = createCommandInteraction("ito", "ping");

    client.emit(Events.InteractionCreate, interaction as never);
    await flushAsyncHandlers();

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith("Pong! ITO adapter is ready.");

    client.destroy();
  });

  it("routes a Just One command without handling it as ITO", async () => {
    const client = createBoardgameDiscordClient();
    registerBoardgameDiscordAdapters(client);
    const interaction = createCommandInteraction("just-one", "create");

    client.emit(Events.InteractionCreate, interaction as never);
    await flushAsyncHandlers();

    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith("Just One game created for this channel.");

    client.destroy();
  });
});

function createCommandInteraction(commandName: "ito" | "just-one", subcommand: string) {
  return {
    commandName,
    channelId: "channel-1",
    isButton: () => false,
    isModalSubmit: () => false,
    isChatInputCommand: () => true,
    options: {
      getSubcommand: () => subcommand
    },
    reply: vi.fn().mockResolvedValue(undefined)
  };
}

async function flushAsyncHandlers(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
}
