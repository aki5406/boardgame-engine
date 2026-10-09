import type { ChatInputCommandInteraction, Client } from "discord.js";
import { ChannelType, Events, ThreadAutoArchiveDuration } from "discord.js";

import type { Engine, WordWolfRandom } from "@boardgame/game-word-wolf";

import {
  createWordWolfDiscordSessionForChannel,
  createWordWolfPrivateWordThreads,
  joinWordWolfDiscordSessionForChannel,
  startWordWolfDiscordSession,
  type CreateWordWolfPrivateWordThreadResult,
  type WordWolfDiscordSessionRegistry
} from "../session/index.js";
import {
  createWordWolfPrivateThreadName,
  createWordWolfPrivateWordMessage,
  createWordWolfStartedReply,
  createWordWolfStartPartialFailureReply
} from "../views/word-wolf-start.js";

export interface RegisterWordWolfInteractionHandlersInput {
  readonly engine: Engine;
  readonly sessionRegistry: WordWolfDiscordSessionRegistry;
  readonly random: WordWolfRandom;
}

export function registerWordWolfInteractionHandlers(
  client: Client,
  input: RegisterWordWolfInteractionHandlersInput
): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== "word-wolf") {
      return;
    }

    await handleWordWolfCommand(interaction, input);
  });
}

async function handleWordWolfCommand(
  interaction: ChatInputCommandInteraction,
  input: RegisterWordWolfInteractionHandlersInput
): Promise<void> {
  const subcommand = interaction.options.getSubcommand(true);

  if (subcommand === "create") {
    const result = createWordWolfDiscordSessionForChannel({
      channelId: interaction.channelId,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    await interaction.reply(
      result.status === "created"
        ? "Word Wolf game created for this channel."
        : "A Word Wolf game already exists in this channel."
    );
    return;
  }

  if (subcommand === "join") {
    const result = joinWordWolfDiscordSessionForChannel({
      channelId: interaction.channelId,
      playerId: interaction.user.id,
      engine: input.engine,
      registry: input.sessionRegistry
    });

    if (result.status === "notFound") {
      await interaction.reply(
        "No Word Wolf game exists in this channel. Use /word-wolf create first."
      );
      return;
    }

    if (result.status === "alreadyJoined") {
      await interaction.reply("You have already joined this Word Wolf game.");
      return;
    }

    if (result.status === "invalidPhase") {
      await interaction.reply("The Word Wolf game has already started.");
      return;
    }

    await interaction.reply(`Joined the Word Wolf game.\nPlayers: ${result.playerCount}`);
    return;
  }

  if (subcommand === "start") {
    const existingSession = input.sessionRegistry.get(interaction.channelId);

    if (!existingSession) {
      await interaction.reply(
        "No Word Wolf game exists in this channel. Use /word-wolf create first."
      );
      return;
    }

    const channel = interaction.channel;

    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply(
        "Word Wolf start requires a regular guild text channel that supports private threads."
      );
      return;
    }

    const result = startWordWolfDiscordSession({
      channelId: interaction.channelId,
      engine: input.engine,
      registry: input.sessionRegistry,
      random: input.random
    });

    if (result.status === "notEnoughPlayers") {
      await interaction.reply("At least three players must join before Word Wolf can start.");
      return;
    }

    if (result.status === "invalidPhase") {
      await interaction.reply("The Word Wolf game has already started.");
      return;
    }

    if (result.status === "noWordPairs") {
      await interaction.reply("Word Wolf could not start because no word pairs are available.");
      return;
    }

    if (result.status === "notFound") {
      await interaction.reply(
        "No Word Wolf game exists in this channel. Use /word-wolf create first."
      );
      return;
    }

    try {
      const threadResult = await createWordWolfPrivateWordThreads({
        channelId: interaction.channelId,
        session: result.session,
        registry: input.sessionRegistry,
        createThreadName: ({ playerId }) => createWordWolfPrivateThreadName(playerId),
        createPrivateWordThread: async ({ playerId, word, threadName }) => {
          const thread = await channel.threads.create({
            name: threadName,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
            type: ChannelType.PrivateThread,
            invitable: false
          });

          await thread.members.add(playerId);
          await thread.send(createWordWolfPrivateWordMessage(word));

          return { threadId: thread.id } satisfies CreateWordWolfPrivateWordThreadResult;
        }
      });

      if (threadResult.status === "partialFailure") {
        await interaction.reply(
          createWordWolfStartPartialFailureReply(
            result.playerCount,
            threadResult.createdCount,
            threadResult.failedCount
          )
        );
        return;
      }

      await interaction.reply(createWordWolfStartedReply(result.playerCount));
    } catch {
      console.error("Failed to create Word Wolf private word threads.");
      await interaction.reply("Word Wolf started, but private word threads could not be created.");
    }
  }
}
