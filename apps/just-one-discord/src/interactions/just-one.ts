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
  deliverJustOneRoles,
  joinJustOneDiscordSessionForChannel,
  startJustOneDiscordSession,
  type JustOneDiscordSessionRegistry
} from "../session/index.js";
import {
  createJustOnePrivateThreadPocRegistry,
  type JustOnePrivateThreadPocRegistry
} from "../poc/registry.js";
import { createJustOneStartedReply } from "../views/just-one-start.js";
import {
  JUST_ONE_PRIVATE_THREAD_POC_DEFAULT_SECRET_WORD,
  createJustOnePrivateThreadPocIntro,
  createJustOnePrivateThreadPocReply
} from "../views/just-one-private-thread-poc.js";

export interface RegisterJustOneInteractionHandlersInput {
  readonly engine: Engine;
  readonly sessionRegistry: JustOneDiscordSessionRegistry;
}

export function registerJustOneInteractionHandlers(
  client: Client,
  input: RegisterJustOneInteractionHandlersInput
): void {
  const privateThreadPocRegistry = createJustOnePrivateThreadPocRegistry();

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (interaction.commandName !== "just-one") {
      return;
    }

    await handleJustOneCommand(interaction, input, privateThreadPocRegistry);
  });

  client.on(Events.MessageCreate, async (message) => {
    await handleJustOnePrivateThreadPocReplyMessage(message, privateThreadPocRegistry);
  });
}

async function handleJustOneCommand(
  interaction: ChatInputCommandInteraction,
  input: RegisterJustOneInteractionHandlersInput,
  privateThreadPocRegistry: JustOnePrivateThreadPocRegistry
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
    return;
  }

  if (subcommand === "thread-poc") {
    const player = interaction.options.getUser("player", true);
    const secretWord =
      interaction.options.getString("word", false) ??
      JUST_ONE_PRIVATE_THREAD_POC_DEFAULT_SECRET_WORD;
    const channel = interaction.channel;

    if (!channel || !hasPrivateThreadCreation(channel)) {
      await interaction.reply(
        "Private thread PoC only works in a regular guild text channel that supports private threads."
      );
      return;
    }

    const thread = await channel.threads.create({
      name: `just-one-hint-${player.username}`,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
      type: ChannelType.PrivateThread,
      invitable: false
    });

    await thread.members.add(player.id);
    await thread.send(createJustOnePrivateThreadPocIntro(secretWord));

    privateThreadPocRegistry.track({
      threadId: thread.id,
      parentChannelId: interaction.channelId,
      invitedPlayerId: player.id,
      secretWord
    });

    await interaction.reply(createJustOnePrivateThreadPocReply(thread.id, player.id));
  }
}

async function handleJustOnePrivateThreadPocReplyMessage(
  message: Message,
  privateThreadPocRegistry: JustOnePrivateThreadPocRegistry
): Promise<void> {
  if (message.author.bot || !message.channel.isThread()) {
    return;
  }

  const entry = privateThreadPocRegistry.get(message.channel.id);

  if (!entry) {
    return;
  }

  privateThreadPocRegistry.recordReply({
    threadId: message.channel.id,
    content: message.content,
    authorId: message.author.id
  });

  console.log(
    JSON.stringify({
      type: "just-one.private-thread-poc.reply",
      threadId: message.channel.id,
      authorId: message.author.id,
      content: message.content
    })
  );
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
