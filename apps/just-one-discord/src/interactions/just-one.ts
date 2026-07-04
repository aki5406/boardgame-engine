import type { ChatInputCommandInteraction, Client } from "discord.js";
import { Events } from "discord.js";

import type { Engine } from "@boardgame/game-just-one";

import {
  createJustOneDiscordSessionForChannel,
  deliverJustOneRoles,
  joinJustOneDiscordSessionForChannel,
  startJustOneDiscordSession,
  type JustOneDiscordSessionRegistry
} from "../session/index.js";
import { createJustOneStartedReply } from "../views/just-one-start.js";

export interface RegisterJustOneInteractionHandlersInput {
  readonly engine: Engine;
  readonly sessionRegistry: JustOneDiscordSessionRegistry;
}

export function registerJustOneInteractionHandlers(
  client: Client,
  input: RegisterJustOneInteractionHandlersInput
): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (interaction.commandName !== "just-one") {
      return;
    }

    await handleJustOneCommand(interaction, input);
  });
}

async function handleJustOneCommand(
  interaction: ChatInputCommandInteraction,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand === "create") {
    const result = createJustOneDiscordSessionForChannel({
      channelId: interaction.channelId,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "alreadyExists") {
      await interaction.reply("Just One game already exists in this channel.");
      return;
    }

    await interaction.reply("Just One game created for this channel.");
    return;
  }

  if (subcommand === "join") {
    const result = joinJustOneDiscordSessionForChannel({
      channelId: interaction.channelId,
      playerId: interaction.user.id,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply(
        "No Just One game exists in this channel. Use /just-one create first."
      );
      return;
    }

    if (result.status === "alreadyJoined") {
      await interaction.reply("You have already joined this Just One game.");
      return;
    }

    await interaction.reply(`Joined the Just One game.\nPlayers: ${result.playerCount}`);
    return;
  }

  if (subcommand === "start") {
    const result = startJustOneDiscordSession({
      channelId: interaction.channelId,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply(
        "No Just One game exists in this channel. Use /just-one create first."
      );
      return;
    }

    if (result.status === "noPlayers") {
      await interaction.reply(
        "No players have joined this Just One game. Use /just-one join first."
      );
      return;
    }

    try {
      await deliverJustOneRoles({
        session: result.session,
        sendDirectMessage: async ({ playerId, message }) => {
          const user = await interaction.client.users.fetch(playerId);
          await user.send(message);
        }
      });
    } catch {
      await interaction.reply("Just One started, but failed to send one or more role DMs.");
      return;
    }

    await interaction.reply(createJustOneStartedReply(result.guesserId, result.hintPlayerCount));
  }
}
