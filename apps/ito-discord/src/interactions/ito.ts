import type { ChatInputCommandInteraction, Client } from "discord.js";
import { Events } from "discord.js";

import type { Engine } from "@boardgame/game-ito";

import {
  assignItoDiscordNumbers,
  createItoDiscordSessionForChannel,
  deliverItoDiscordNumbers,
  getItoDiscordSessionStatus,
  joinItoDiscordSessionForChannel,
  revealItoDiscordResult,
  resetItoDiscordSessionForChannel,
  setItoDiscordSessionTheme,
  startItoDiscordDiscussion,
  startItoDiscordSession,
  submitItoDiscordOrder,
  type ItoDiscordSessionRegistry
} from "../session/index.js";
import { formatItoHelpMessage } from "../views/ito-help.js";
import { formatItoRevealMessage } from "../views/ito-reveal.js";
import { formatItoStatusMessage } from "../views/ito-status.js";

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

  if (subcommand === "assign") {
    const result = assignItoDiscordNumbers({
      channelId: interaction.channelId,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO game exists in this channel. Use /ito create first.");
      return;
    }

    if (result.status === "noPlayers") {
      await interaction.reply("No players have joined this ITO game. Use /ito join first.");
      return;
    }

    await interaction.reply(`ITO numbers assigned.\nPlayers: ${result.playerCount}`);
    return;
  }

  if (subcommand === "deliver") {
    const result = await deliverItoDiscordNumbers({
      channelId: interaction.channelId,
      registry: input.sessionRegistry,
      sendDirectMessage: async ({ playerId, message }) => {
        const user = await interaction.client.users.fetch(playerId);
        await user.send(message);
      }
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO game exists in this channel. Use /ito create first.");
      return;
    }

    if (result.status === "notAssigned") {
      await interaction.reply("No ITO numbers have been assigned yet. Use /ito assign first.");
      return;
    }

    await interaction.reply(
      `ITO numbers delivery finished.\nSucceeded: ${result.succeeded}\nFailed: ${result.failed}`
    );
    return;
  }

  if (subcommand === "discuss") {
    const result = startItoDiscordDiscussion({
      channelId: interaction.channelId,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO game exists in this channel. Use /ito create first.");
      return;
    }

    if (result.status === "noTheme") {
      await interaction.reply("No ITO theme has been set yet. Use /ito theme first.");
      return;
    }

    if (result.status === "notAssigned") {
      await interaction.reply("No ITO numbers have been assigned yet. Use /ito assign first.");
      return;
    }

    await interaction.reply(
      `ITO discussion started.\nTheme:\n${result.theme}\nEveryone, discuss without revealing your number.\nPlayers: ${result.playerCount}`
    );
    return;
  }

  if (subcommand === "ping") {
    await interaction.reply("Pong! ITO adapter is ready.");
    return;
  }

  if (subcommand === "help") {
    await interaction.reply(formatItoHelpMessage());
    return;
  }

  if (subcommand === "create") {
    const result = createItoDiscordSessionForChannel({
      channelId: interaction.channelId,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "alreadyExists") {
      await interaction.reply("ITO game already exists in this channel.");
      return;
    }

    await interaction.reply("ITO game created for this channel.");
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
      await interaction.reply("No ITO game exists in this channel. Use /ito create first.");
      return;
    }

    if (result.status === "alreadyJoined") {
      await interaction.reply("You have already joined this ITO game.");
      return;
    }

    await interaction.reply(`Joined the ITO game.\nPlayers: ${result.playerCount}`);
    return;
  }

  if (subcommand === "reveal") {
    const result = revealItoDiscordResult({
      channelId: interaction.channelId,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO game exists in this channel.");
      return;
    }

    if (result.status === "notAssigned") {
      await interaction.reply("No ITO numbers have been assigned yet. Use /ito assign first.");
      return;
    }

    if (result.status === "notSubmitted") {
      await interaction.reply("No ITO order has been submitted yet. Use /ito submit first.");
      return;
    }

    await interaction.reply(formatItoRevealMessage(result));
    return;
  }

  if (subcommand === "status") {
    const result = getItoDiscordSessionStatus({
      channelId: interaction.channelId,
      registry: input.sessionRegistry
    });

    await interaction.reply(formatItoStatusMessage(result));
    return;
  }

  if (subcommand === "reset") {
    const result = resetItoDiscordSessionForChannel({
      channelId: interaction.channelId,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO game exists in this channel.");
      return;
    }

    await interaction.reply("ITO game reset for this channel.");
    return;
  }

  if (subcommand === "start") {
    const result = startItoDiscordSession({
      channelId: interaction.channelId,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO game exists in this channel. Use /ito create first.");
      return;
    }

    if (result.status === "noPlayers") {
      await interaction.reply("No players have joined this ITO game. Use /ito join first.");
      return;
    }

    await interaction.reply(`ITO game started.\nPlayers: ${result.playerCount}`);
    return;
  }

  if (subcommand === "submit") {
    const order = interaction.options.getString("order", true);
    const result = submitItoDiscordOrder({
      channelId: interaction.channelId,
      engine: input.engine,
      order,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply("No ITO game exists in this channel. Use /ito create first.");
      return;
    }

    if (result.status === "emptyOrder") {
      await interaction.reply("No player order was provided.");
      return;
    }

    await interaction.reply(`ITO order submitted.\nPlayers: ${result.playerCount}`);
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
      await interaction.reply("No ITO game exists in this channel. Use /ito create first.");
      return;
    }

    await interaction.reply(`ITO theme set:\n${result.theme}`);
  }
}
