import type {
  ChatInputCommandInteraction,
  Client,
  GuildTextBasedChannel,
  Message,
  PrivateThreadChannel
} from "discord.js";
import { ChannelType, Events, ThreadAutoArchiveDuration } from "discord.js";

import type { Engine } from "@boardgame/game-just-one";

import {
  createJustOneDiscordSessionForChannel,
  joinJustOneDiscordSessionForChannel,
  createJustOnePrivateHintThreads,
  startJustOneDiscordSession,
  submitJustOneHintFromThread,
  type JustOneDiscordSessionRegistry
} from "../session/index.js";
import {
  createJustOneHintPlayerThreadIntro,
  createJustOneHintThreadName,
  createJustOneStartPartialFailureReply,
  createJustOneStartedReply
} from "../views/just-one-start.js";
import { createJustOneHintConfirmationReply } from "../views/just-one-hint.js";
import { type CreateJustOnePrivateHintThreadResult } from "../session/private-threads.js";

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

  client.on(Events.MessageCreate, async (message) => {
    await handleJustOneThreadMessage(message, input);
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
    const channel = interaction.channel;
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

    if (!channel || !hasPrivateThreadCreation(channel)) {
      await interaction.reply(
        "Just One start requires a regular guild text channel that supports private threads."
      );
      return;
    }

    const threadResult = await createJustOnePrivateHintThreads({
      channelId: interaction.channelId,
      session: result.session,
      registry: input.sessionRegistry,
      createThreadName: ({ playerId }) => createJustOneHintThreadName(playerId),
      createPrivateHintThread: async ({
        playerId,
        secretWord,
        threadName
      }): Promise<CreateJustOnePrivateHintThreadResult> => {
        const thread = await channel.threads.create({
          name: threadName,
          autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
          type: ChannelType.PrivateThread,
          invitable: false
        });

        await thread.members.add(playerId);
        await thread.send(createJustOneHintPlayerThreadIntro(secretWord));

        return {
          threadId: thread.id
        };
      }
    });

    if (threadResult.status === "partialFailure") {
      await interaction.reply(
        createJustOneStartPartialFailureReply(
          result.guesserId,
          result.hintPlayerCount,
          threadResult.createdCount,
          threadResult.failedCount
        )
      );
      return;
    }

    await interaction.reply(createJustOneStartedReply(result.guesserId, result.hintPlayerCount));
    return;
  }
}

async function handleJustOneThreadMessage(
  message: Message,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  if (!message.channel.isThread()) {
    return;
  }

  const result = submitJustOneHintFromThread({
    threadId: message.channel.id,
    authorId: message.author.id,
    authorIsBot: message.author.bot,
    content: message.content,
    engine: input.engine,
    registry: input.sessionRegistry
  });

  if (result.status === "submitted") {
    await message.channel.send(createJustOneHintConfirmationReply(result.status));
    return;
  }

  if (result.status === "updated") {
    await message.channel.send(createJustOneHintConfirmationReply(result.status));
  }
}

function hasPrivateThreadCreation(
  channel: ChatInputCommandInteraction["channel"]
): channel is GuildTextBasedChannel & {
  threads: {
    create: (options: {
      name: string;
      autoArchiveDuration: ThreadAutoArchiveDuration;
      type: ChannelType.PrivateThread;
      invitable: boolean;
    }) => Promise<PrivateThreadChannel>;
  };
} {
  return channel !== null && "threads" in channel && channel.type === ChannelType.GuildText;
}
