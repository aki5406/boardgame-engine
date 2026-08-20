import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  Message,
  ModalSubmitInteraction
} from "discord.js";
import { ChannelType, Events, ThreadAutoArchiveDuration } from "discord.js";

import { getHintSubmissionProgress, type Engine } from "@boardgame/game-just-one";

import {
  createJustOneDiscordSessionForChannel,
  createJustOneDuplicateReviewThread,
  confirmJustOneDuplicateReview,
  joinJustOneDiscordSessionForChannel,
  createJustOnePrivateHintThreads,
  startJustOneDiscordSession,
  startJustOneDuplicateReviewForChannel,
  submitJustOneHintFromThread,
  toggleJustOneReviewHint,
  publishJustOneGuessingHints,
  submitJustOneGuess,
  updateJustOneHintProgress,
  getJustOneState,
  type JustOneDiscordSessionRegistry
} from "../session/index.js";
import {
  createJustOneHintPlayerThreadIntro,
  createJustOneHintThreadName,
  createJustOneStartPartialFailureReply,
  createJustOneStartedReply
} from "../views/just-one-start.js";
import { createJustOneHintConfirmationReply } from "../views/just-one-hint.js";
import { createJustOneHintProgressMessage } from "../views/just-one-hint-progress.js";
import {
  createJustOneDuplicateReviewFailureReply,
  createJustOneDuplicateReviewMessage,
  createJustOneDuplicateReviewThreadName,
  isJustOneConfirmHintsCustomId,
  parseJustOneHintToggleCustomId
} from "../views/just-one-duplicate-review.js";
import { type CreateJustOnePrivateHintThreadResult } from "../session/private-threads.js";
import {
  createJustOneGuessModal,
  getJustOneGuessTextInputCustomId,
  isJustOneGuessModalCustomId,
  isJustOneSubmitGuessCustomId
} from "../views/just-one-guessing.js";

export interface RegisterJustOneInteractionHandlersInput {
  readonly engine: Engine;
  readonly sessionRegistry: JustOneDiscordSessionRegistry;
}

export function registerJustOneInteractionHandlers(
  client: Client,
  input: RegisterJustOneInteractionHandlersInput
): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName !== "just-one") {
        return;
      }

      await handleJustOneCommand(interaction, input);
      return;
    }

    if (interaction.isButton()) {
      if (isJustOneSubmitGuessCustomId(interaction.customId)) {
        await handleJustOneSubmitGuessButton(interaction, input);
        return;
      }

      await handleJustOneDuplicateReviewButton(interaction, input);
      return;
    }

    if (interaction.isModalSubmit() && isJustOneGuessModalCustomId(interaction.customId)) {
      await handleJustOneGuessModalSubmit(interaction, input);
    }
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

    if (!channel || channel.type !== ChannelType.GuildText) {
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

    const progressMessage = await interaction.followUp({
      content: createJustOneHintProgressMessage(
        getHintSubmissionProgress(getJustOneState(result.session))
      ),
      fetchReply: true
    });
    input.sessionRegistry.registerHintProgressMessage({
      channelId: interaction.channelId,
      sessionId: result.session.id,
      messageId: progressMessage.id
    });
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
    await updateHintProgressMessage(message, input);
    await startDuplicateReviewIfReady(message, input);
    return;
  }

  if (result.status === "updated") {
    await message.channel.send(createJustOneHintConfirmationReply(result.status));
    await updateHintProgressMessage(message, input);
    await startDuplicateReviewIfReady(message, input);
  }
}

async function startDuplicateReviewIfReady(
  message: Message,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  const hintThread = input.sessionRegistry.getHintThread(message.channel.id);

  if (!hintThread) {
    return;
  }

  const result = startJustOneDuplicateReviewForChannel({
    channelId: hintThread.channelId,
    engine: input.engine,
    registry: input.sessionRegistry
  });

  if (result.status !== "started") {
    return;
  }

  try {
    const channel = await message.client.channels.fetch(hintThread.channelId);

    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error("Just One duplicate review requires a regular guild text channel");
    }

    await createJustOneDuplicateReviewThread({
      channelId: hintThread.channelId,
      session: result.session,
      registry: input.sessionRegistry,
      threadName: createJustOneDuplicateReviewThreadName(),
      createPrivateThread: async ({ threadName, hintPlayerIds }) => {
        const thread = await channel.threads.create({
          name: threadName,
          autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
          type: ChannelType.PrivateThread,
          invitable: false
        });

        for (const playerId of hintPlayerIds) {
          await thread.members.add(playerId);
        }

        const managementMessage = await thread.send(
          createJustOneDuplicateReviewMessage(getJustOneState(result.session))
        );

        return {
          threadId: thread.id,
          messageId: managementMessage.id
        };
      }
    });
  } catch {
    console.error("Failed to start Just One duplicate review.");
    await sendDuplicateReviewFailureReply(message, hintThread.channelId);
  }
}

async function handleJustOneSubmitGuessButton(
  interaction: ButtonInteraction,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  const channelId = interaction.channelId;

  if (!channelId) {
    await interaction.reply({
      content: "The answer has already been submitted.",
      ephemeral: true
    });
    return;
  }

  const guessingMessage = input.sessionRegistry.getGuessingMessage(channelId);
  const session = input.sessionRegistry.get(channelId);

  if (!guessingMessage || guessingMessage.messageId !== interaction.message.id || !session) {
    await interaction.reply({
      content: "The answer has already been submitted.",
      ephemeral: true
    });
    return;
  }

  const state = getJustOneState(session);

  if (state.phase !== "guessing") {
    await interaction.reply({
      content: "The answer has already been submitted.",
      ephemeral: true
    });
    return;
  }

  if (
    interaction.user.bot ||
    !state.players.includes(interaction.user.id) ||
    state.guesserId !== interaction.user.id
  ) {
    await interaction.reply({
      content: "Only the Guesser can submit the answer.",
      ephemeral: true
    });
    return;
  }

  await interaction.showModal(createJustOneGuessModal());
}

async function handleJustOneGuessModalSubmit(
  interaction: ModalSubmitInteraction,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  const channelId = interaction.channelId;

  if (!channelId) {
    await interaction.reply({
      content: "The answer has already been submitted.",
      ephemeral: true
    });
    return;
  }

  const session = input.sessionRegistry.get(channelId);

  if (!session || getJustOneState(session).phase !== "guessing") {
    await interaction.reply({
      content: "The answer has already been submitted.",
      ephemeral: true
    });
    return;
  }

  const state = getJustOneState(session);

  if (
    interaction.user.bot ||
    !state.players.includes(interaction.user.id) ||
    state.guesserId !== interaction.user.id
  ) {
    await interaction.reply({
      content: "Only the Guesser can submit the answer.",
      ephemeral: true
    });
    return;
  }

  const result = submitJustOneGuess({
    channelId,
    playerId: interaction.user.id,
    guess: interaction.fields.getTextInputValue(getJustOneGuessTextInputCustomId()),
    engine: input.engine,
    registry: input.sessionRegistry
  });

  if (result.status === "emptyGuess") {
    await interaction.reply({
      content: "Please enter an answer.",
      ephemeral: true
    });
    return;
  }

  if (result.status === "notGuesser" || result.status === "notPlayer") {
    await interaction.reply({
      content: "Only the Guesser can submit the answer.",
      ephemeral: true
    });
    return;
  }

  if (result.status !== "submitted") {
    await interaction.reply({
      content: "The answer has already been submitted.",
      ephemeral: true
    });
    return;
  }

  await interaction.reply({
    content: "Guess submitted.",
    ephemeral: true
  });

  const guessingMessage = input.sessionRegistry.getGuessingMessage(channelId);

  if (!guessingMessage || guessingMessage.sessionId !== result.session.id) {
    return;
  }

  try {
    const channel = await interaction.client.channels.fetch(channelId);

    if (!channel?.isTextBased()) {
      throw new Error("Just One guessing channel is unavailable");
    }

    const message = await channel.messages.fetch(guessingMessage.messageId);
    await message.edit({ components: [] });
  } catch {
    console.error("Failed to update Just One guessing message.");
  }
}

async function handleJustOneDuplicateReviewButton(
  interaction: ButtonInteraction,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  if (isJustOneConfirmHintsCustomId(interaction.customId)) {
    await handleJustOneDuplicateReviewConfirm(interaction, input);
    return;
  }

  const playerId = parseJustOneHintToggleCustomId(interaction.customId);

  if (!playerId) {
    return;
  }

  const reviewThread = input.sessionRegistry.getDuplicateReviewThread(interaction.channelId);

  if (!reviewThread || reviewThread.messageId !== interaction.message.id) {
    await interaction.reply({
      content: "This hint is no longer available.",
      ephemeral: true
    });
    return;
  }

  if (interaction.user.bot) {
    await interaction.reply({
      content: "Only Hint Players can review hints.",
      ephemeral: true
    });
    return;
  }

  const result = toggleJustOneReviewHint({
    threadId: interaction.channelId,
    actorId: interaction.user.id,
    playerId,
    engine: input.engine,
    registry: input.sessionRegistry
  });

  if (result.status === "notHintPlayer") {
    await interaction.reply({
      content: "Only Hint Players can review hints.",
      ephemeral: true
    });
    return;
  }

  if (result.status === "invalidPhase") {
    await interaction.reply({
      content: "Duplicate review is not active.",
      ephemeral: true
    });
    return;
  }

  if (result.status !== "updated") {
    await interaction.reply({
      content: "This hint is no longer available.",
      ephemeral: true
    });
    return;
  }

  try {
    await interaction.update(createJustOneDuplicateReviewMessage(getJustOneState(result.session)));
  } catch {
    console.error("Failed to update Just One duplicate review message.");

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "The hint was updated, but the review message could not be refreshed.",
        ephemeral: true
      });
    }
  }
}

async function handleJustOneDuplicateReviewConfirm(
  interaction: ButtonInteraction,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  const reviewThread = input.sessionRegistry.getDuplicateReviewThread(interaction.channelId);

  if (!reviewThread || reviewThread.messageId !== interaction.message.id) {
    await interaction.reply({
      content: "This duplicate review is no longer available.",
      ephemeral: true
    });
    return;
  }

  if (interaction.user.bot) {
    await interaction.reply({
      content: "Only Hint Players can review hints.",
      ephemeral: true
    });
    return;
  }

  const result = confirmJustOneDuplicateReview({
    threadId: interaction.channelId,
    actorId: interaction.user.id,
    engine: input.engine,
    registry: input.sessionRegistry
  });

  if (result.status === "notHintPlayer") {
    await interaction.reply({
      content: "Only Hint Players can review hints.",
      ephemeral: true
    });
    return;
  }

  if (result.status === "invalidPhase") {
    await interaction.reply({
      content: "Duplicate review is already complete.",
      ephemeral: true
    });
    return;
  }

  if (result.status !== "confirmed") {
    await interaction.reply({
      content: "This duplicate review is no longer available.",
      ephemeral: true
    });
    return;
  }

  try {
    await interaction.update(createJustOneDuplicateReviewMessage(getJustOneState(result.session)));
  } catch {
    console.error("Failed to confirm Just One duplicate review message.");

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Hints were confirmed, but the review message could not be refreshed.",
        ephemeral: true
      });
    }
  }

  try {
    await publishJustOneGuessingHints({
      channelId: reviewThread.channelId,
      registry: input.sessionRegistry,
      publishMessage: async ({ content, components, guesserId }) => {
        const channel = await interaction.client.channels.fetch(reviewThread.channelId);

        if (!channel?.isSendable()) {
          throw new Error("Just One guessing channel is unavailable");
        }

        const guessingMessage = await channel.send({
          content,
          components,
          allowedMentions: {
            parse: [],
            users: [guesserId]
          }
        });

        return { messageId: guessingMessage.id };
      }
    });
  } catch {
    console.error("Failed to publish Just One guessing hints.");
  }
}

async function updateHintProgressMessage(
  message: Message,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  const hintThread = input.sessionRegistry.getHintThread(message.channel.id);

  if (!hintThread) {
    return;
  }

  try {
    await updateJustOneHintProgress({
      channelId: hintThread.channelId,
      registry: input.sessionRegistry,
      editProgressMessage: async ({ messageId, content }) => {
        const channel = await message.client.channels.fetch(hintThread.channelId);

        if (!channel?.isTextBased()) {
          throw new Error("Just One progress channel is unavailable");
        }

        const progressMessage = await channel.messages.fetch(messageId);
        await progressMessage.edit(content);
      }
    });
  } catch {
    console.error("Failed to update Just One hint progress message.");
  }
}

async function sendDuplicateReviewFailureReply(message: Message, channelId: string): Promise<void> {
  try {
    const channel = await message.client.channels.fetch(channelId);

    if (!channel?.isSendable()) {
      throw new Error("Just One duplicate review channel is unavailable");
    }

    await channel.send(createJustOneDuplicateReviewFailureReply());
  } catch {
    console.error("Failed to send Just One duplicate review failure reply.");
  }
}
