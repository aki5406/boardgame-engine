import type { ChatInputCommandInteraction, Client } from "discord.js";
import { Events } from "discord.js";

export function registerItoInteractionHandlers(client: Client): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (interaction.commandName !== "ito") {
      return;
    }

    await handleItoCommand(interaction);
  });
}

async function handleItoCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const subcommand = interaction.options.getSubcommand(false);

  if (subcommand !== "ping") {
    return;
  }

  await interaction.reply("Pong! ITO adapter is ready.");
}
