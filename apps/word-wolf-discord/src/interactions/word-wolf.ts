import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  StringSelectMenuInteraction
} from "discord.js";
import { ChannelType, Events, ThreadAutoArchiveDuration } from "discord.js";

import {
  getVoteProgress,
  type Engine,
  type WordWolfRandom,
  type WordWolfState
} from "@boardgame/game-word-wolf";

import {
  createWordWolfDiscordSessionForChannel,
  createWordWolfPrivateWordThreads,
  joinWordWolfDiscordSessionForChannel,
  startWordWolfDiscordSession,
  startWordWolfVoting,
  submitWordWolfVote,
  type CreateWordWolfPrivateWordThreadResult,
  type WordWolfDiscordSessionRegistry
} from "../session/index.js";
import {
  createWordWolfPrivateThreadName,
  createWordWolfPrivateWordMessage,
  createWordWolfStartedReply,
  createWordWolfStartPartialFailureReply,
  createWordWolfVotingStartedReply,
  isWordWolfStartVotingCustomId,
  isWordWolfVoteCustomId
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
    if (interaction.isChatInputCommand() && interaction.commandName === "word-wolf") {
      await handleWordWolfCommand(interaction, input);
      return;
    }

    if (interaction.isButton?.() && isWordWolfStartVotingCustomId(interaction.customId)) {
      await handleWordWolfStartVotingButton(interaction, input);
      return;
    }

    if (interaction.isStringSelectMenu?.() && isWordWolfVoteCustomId(interaction.customId)) {
      await handleWordWolfVoteSelect(interaction, input);
    }
  });
}

async function handleWordWolfStartVotingButton(
  interaction: ButtonInteraction,
  input: RegisterWordWolfInteractionHandlersInput
): Promise<void> {
  const result = startWordWolfVoting({
    channelId: interaction.channelId,
    playerId: interaction.user.id,
    engine: input.engine,
    registry: input.sessionRegistry
  });

  if (result.status === "notFound") {
    await interaction.reply({
      content: "This Word Wolf game is no longer available.",
      ephemeral: true
    });
    return;
  }

  if (result.status === "notParticipant") {
    await interaction.reply({
      content: "Only players in this Word Wolf game can start voting.",
      ephemeral: true
    });
    return;
  }

  if (result.status === "invalidPhase") {
    await interaction.reply({
      content: "Voting has already started.",
      ephemeral: true
    });
    return;
  }

  try {
    await interaction.update(createWordWolfVotingReply(result.session.state as WordWolfState));
  } catch {
    console.error("Failed to update Word Wolf voting interaction.");
  }
}

async function handleWordWolfVoteSelect(
  interaction: StringSelectMenuInteraction,
  input: RegisterWordWolfInteractionHandlersInput
): Promise<void> {
  const targetPlayerId = interaction.values[0];

  if (!targetPlayerId) {
    await interaction.reply({
      content: "That player is no longer available.",
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const result = submitWordWolfVote({
    channelId: interaction.channelId,
    voterPlayerId: interaction.user.id,
    targetPlayerId,
    engine: input.engine,
    registry: input.sessionRegistry
  });

  if (result.status !== "submitted") {
    await interaction.editReply(getWordWolfVoteErrorMessage(result.status));
    return;
  }

  try {
    await interaction.message.edit(
      createWordWolfVotingReply(result.session.state as WordWolfState)
    );
  } catch {
    console.error("Failed to update Word Wolf vote progress.");
  }

  await interaction.editReply("Your vote has been recorded.");
}

function getWordWolfVoteErrorMessage(
  status: Exclude<ReturnType<typeof submitWordWolfVote>["status"], "submitted">
): string {
  switch (status) {
    case "notFound":
      return "This Word Wolf game is no longer available.";
    case "invalidPhase":
      return "Voting is not available right now.";
    case "voterNotParticipant":
      return "Only players in this Word Wolf game can vote.";
    case "targetNotParticipant":
      return "That player is no longer available.";
    case "selfVote":
      return "You cannot vote for yourself.";
    case "alreadyVoted":
      return "You have already voted.";
  }
}

function createWordWolfVotingReply(state: WordWolfState) {
  const progress = getVoteProgress(state);

  return createWordWolfVotingStartedReply({
    playerIds: state.players,
    submittedVotes: progress.submitted,
    totalVotes: progress.total,
    complete: progress.complete
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

    await interaction.deferReply();

    const result = startWordWolfDiscordSession({
      channelId: interaction.channelId,
      engine: input.engine,
      registry: input.sessionRegistry,
      random: input.random
    });

    if (result.status === "notEnoughPlayers") {
      await editStartReply(
        interaction,
        "At least three players must join before Word Wolf can start."
      );
      return;
    }

    if (result.status === "invalidPhase") {
      await editStartReply(interaction, "The Word Wolf game has already started.");
      return;
    }

    if (result.status === "noWordPairs") {
      await editStartReply(
        interaction,
        "Word Wolf could not start because no word pairs are available."
      );
      return;
    }

    if (result.status === "notFound") {
      await editStartReply(
        interaction,
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
        await editStartReply(
          interaction,
          createWordWolfStartPartialFailureReply(
            result.playerCount,
            threadResult.createdCount,
            threadResult.failedCount
          )
        );
        return;
      }

      await editStartReply(interaction, createWordWolfStartedReply(result.playerCount));
    } catch {
      console.error("Failed to create Word Wolf private word threads.");
      await editStartReply(
        interaction,
        "Word Wolf started, but private word threads could not be created."
      );
    }
  }
}

async function editStartReply(
  interaction: ChatInputCommandInteraction,
  content: Parameters<ChatInputCommandInteraction["editReply"]>[0]
): Promise<void> {
  try {
    await interaction.editReply(content);
  } catch {
    console.error("Failed to update Word Wolf start interaction.");
  }
}
