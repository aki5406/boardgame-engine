import type { ChatInputCommandInteraction, Client } from "discord.js";
import { Events } from "discord.js";

import type { Engine } from "@boardgame/game-ito";

import {
  createItoDiscordSessionForChannel,
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
  }
}
