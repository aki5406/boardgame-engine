import type { ChatInputCommandInteraction, Client } from "discord.js";
import { Events } from "discord.js";

import type { Engine } from "@boardgame/game-ito";

import {
  createItoDiscordSessionForChannel,
  getItoDiscordSessionStatus,
  joinItoDiscordSessionForChannel,
  setItoDiscordSessionTheme,
  startItoDiscordSession,
  type ItoDiscordSessionRegistry
} from "../session/index.js";

export interface RegisterItoInteractionHandlersInput {
  readonly engine: Engine;
  readonly sessionRegistry: ItoDiscordSessionRegistry;
}

export function registerItoInteractionHandlers(
  client: Client,
  input: RegisterItoInteractionHandlersInput
): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (interaction.commandName !== "ito") {
      return;
    }

    await handleItoCommand(interaction, input);
  });
}

async function handleItoCommand(
  interaction: ChatInputCommandInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
  const subcommand = interaction.options.getSubcommand(false);

  if (subcommand === "ping") {
    await interaction.reply("Pong! ITO adapter is ready.");
    return;
  }

  if (subcommand === "create") {
    const result = createItoDiscordSessionForChannel({
      channelId: interaction.channelId,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "alreadyExists") {
      await interaction.reply("An ITO session already exists in this channel.");
      return;
    }

    await interaction.reply("ITO session created for this channel.");
    return;
  }

  if (subcommand === "join") {
    const result = joinItoDiscordSessionForChannel({
      channelId: interaction.channelId,
      playerId: interaction.user.id,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO session exists in this channel. Use /ito create first.");
      return;
    }

    if (result.status === "alreadyJoined") {
      await interaction.reply("You have already joined this ITO session.");
      return;
    }

    await interaction.reply("Joined the ITO session.");
    return;
  }

  if (subcommand === "status") {
    const result = getItoDiscordSessionStatus({
      channelId: interaction.channelId,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO session exists in this channel. Use /ito create first.");
      return;
    }

    await interaction.reply(
      `ITO session status:\nSession: ${result.sessionId}\nPlayers: ${result.playerCount}`
    );
    return;
  }

  if (subcommand === "start") {
    const result = startItoDiscordSession({
      channelId: interaction.channelId,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO session exists in this channel. Use /ito create first.");
      return;
    }

    if (result.status === "noPlayers") {
      await interaction.reply("No players have joined this ITO session. Use /ito join first.");
      return;
    }

    await interaction.reply(`ITO session started.\nPlayers: ${result.playerCount}`);
    return;
  }

  if (subcommand === "theme") {
    const topic = interaction.options.getString("topic", true);
    const result = setItoDiscordSessionTheme({
      channelId: interaction.channelId,
      theme: topic,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO session exists in this channel. Use /ito create first.");
      return;
    }

    await interaction.reply(`ITO theme set:\n${result.theme}`);
  }
}
