import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  Message,
  ModalSubmitInteraction
} from "discord.js";
import { ChannelType, Events, ThreadAutoArchiveDuration } from "discord.js";

import {
  getHintSubmissionProgress,
  getRevealResult,
  getRoundPoints,
  type Engine,
  type JustOneRandom
} from "@boardgame/game-just-one";

import {
  createJustOneDiscordSessionForChannel,
  createJustOneDuplicateReviewThread,
  confirmJustOneResult,
  confirmJustOneDuplicateReview,
  joinJustOneDiscordSessionForChannel,
  createJustOnePrivateHintThreads,
  startNextJustOneDiscordRound,
  startJustOneDiscordSession,
  startJustOneDuplicateReviewForChannel,
  scoreJustOneRound,
  submitJustOneHintFromThread,
  toggleJustOneReviewHint,
  publishJustOneGuessingHints,
  submitJustOneGuess,
  updateJustOneHintProgress,
  getJustOneState,
  type JustOneDiscordSession,
  type JustOneDiscordSessionRegistry
} from "../session/index.js";
import {
  createJustOneHintPlayerThreadIntro,
  createJustOneHintThreadName,
  createJustOneNextRoundPartialFailureReply,
  createJustOneNextRoundStartedReply,
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
import {
  createJustOneRevealMessage,
  isJustOneNextRoundCustomId,
  isJustOneScoreRoundCustomId,
  parseJustOneResultCustomId
} from "../views/just-one-reveal.js";

export interface RegisterJustOneInteractionHandlersInput {
  readonly engine: Engine;
  readonly sessionRegistry: JustOneDiscordSessionRegistry;
  readonly random: JustOneRandom;
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

      if (parseJustOneResultCustomId(interaction.customId)) {
        await handleJustOneResultButton(interaction, input);
        return;
      }

      if (isJustOneScoreRoundCustomId(interaction.customId)) {
        await handleJustOneScoreRoundButton(interaction, input);
        return;
      }

      if (isJustOneNextRoundCustomId(interaction.customId)) {
        await handleJustOneNextRoundButton(interaction, input);
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
      registry: input.sessionRegistry,
      random: input.random
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
          result.roundNumber,
          threadResult.createdCount,
          threadResult.failedCount
        )
      );
      return;
    }

    await interaction.reply(
      createJustOneStartedReply(result.guesserId, result.hintPlayerCount, result.roundNumber)
    );

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

  if (guessingMessage && guessingMessage.sessionId === result.session.id) {
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

  try {
    const reveal = getJustOneRevealMessage(result.session);

    if (!reveal) {
      throw new Error("Just One reveal state is unavailable");
    }

    const channel = await interaction.client.channels.fetch(channelId);

    if (!channel?.isSendable()) {
      throw new Error("Just One reveal channel is unavailable");
    }

    const revealMessage = await channel.send({
      ...reveal,
      allowedMentions: {
        parse: [],
        users: [getJustOneState(result.session).guesserId!]
      }
    });
    input.sessionRegistry.registerRevealMessage({
      channelId,
      sessionId: result.session.id,
      messageId: revealMessage.id
    });
  } catch {
    console.error("Failed to publish Just One reveal message.");
  }
}

async function handleJustOneResultButton(
  interaction: ButtonInteraction,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  const result = parseJustOneResultCustomId(interaction.customId);
  const channelId = interaction.channelId;

  if (!result || !channelId) {
    return;
  }

  const revealMessage = input.sessionRegistry.getRevealMessage(channelId);
  const session = input.sessionRegistry.get(channelId);

  if (
    !revealMessage ||
    revealMessage.messageId !== interaction.message.id ||
    !session ||
    revealMessage.sessionId !== session.id
  ) {
    await interaction.reply({
      content: "The result has already been confirmed.",
      ephemeral: true
    });
    return;
  }

  const state = getJustOneState(session);

  if (state.phase !== "answered") {
    await interaction.reply({
      content: "The result has already been confirmed.",
      ephemeral: true
    });
    return;
  }

  if (interaction.user.bot || !state.players.includes(interaction.user.id)) {
    await interaction.reply({
      content: "Only game participants can confirm the result.",
      ephemeral: true
    });
    return;
  }

  const confirmation = confirmJustOneResult({
    channelId,
    result,
    engine: input.engine,
    registry: input.sessionRegistry
  });

  if (confirmation.status !== "confirmed") {
    await interaction.reply({
      content: "The result has already been confirmed.",
      ephemeral: true
    });
    return;
  }

  const reveal = getJustOneRevealMessage(confirmation.session);

  if (!reveal) {
    await interaction.reply({
      content: "The result was confirmed, but the reveal message could not be refreshed.",
      ephemeral: true
    });
    return;
  }

  try {
    await interaction.update(reveal);
  } catch {
    console.error("Failed to update Just One reveal message.");

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "The result was confirmed, but the reveal message could not be refreshed.",
        ephemeral: true
      });
    }
  }
}

async function handleJustOneScoreRoundButton(
  interaction: ButtonInteraction,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  const channelId = interaction.channelId;
  const revealMessage = channelId ? input.sessionRegistry.getRevealMessage(channelId) : undefined;
  const session = channelId ? input.sessionRegistry.get(channelId) : undefined;

  if (
    !channelId ||
    !revealMessage ||
    revealMessage.messageId !== interaction.message.id ||
    !session ||
    revealMessage.sessionId !== session.id ||
    getJustOneState(session).phase !== "resultConfirmed"
  ) {
    await interaction.reply({
      content: "This round has already been scored.",
      ephemeral: true
    });
    return;
  }

  if (interaction.user.bot || !getJustOneState(session).players.includes(interaction.user.id)) {
    await interaction.reply({
      content: "Only game participants can score the round.",
      ephemeral: true
    });
    return;
  }

  const result = scoreJustOneRound({
    channelId,
    engine: input.engine,
    registry: input.sessionRegistry
  });

  if (result.status !== "scored") {
    await interaction.reply({
      content: "This round has already been scored.",
      ephemeral: true
    });
    return;
  }

  const reveal = getJustOneRevealMessage(result.session);

  if (!reveal) {
    await interaction.reply({
      content: "The round was scored, but the result message could not be refreshed.",
      ephemeral: true
    });
    return;
  }

  try {
    await interaction.update(reveal);
  } catch {
    console.error("Failed to update Just One scored round message.");

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "The round was scored, but the result message could not be refreshed.",
        ephemeral: true
      });
    }
  }
}

async function handleJustOneNextRoundButton(
  interaction: ButtonInteraction,
  input: RegisterJustOneInteractionHandlersInput
): Promise<void> {
  const channelId = interaction.channelId;
  const revealMessage = channelId ? input.sessionRegistry.getRevealMessage(channelId) : undefined;
  const session = channelId ? input.sessionRegistry.get(channelId) : undefined;
  const channel = interaction.channel;

  if (
    !channelId ||
    !revealMessage ||
    revealMessage.messageId !== interaction.message.id ||
    !session ||
    revealMessage.sessionId !== session.id ||
    getJustOneState(session).phase !== "roundScored"
  ) {
    await interaction.reply({
      content: "This next round has already started.",
      ephemeral: true
    });
    return;
  }

  if (interaction.user.bot || !getJustOneState(session).players.includes(interaction.user.id)) {
    await interaction.reply({
      content: "Only game participants can start the next round.",
      ephemeral: true
    });
    return;
  }

  if (!channel || channel.type !== ChannelType.GuildText) {
    await interaction.reply({
      content:
        "The next round requires a regular guild text channel that supports private threads.",
      ephemeral: true
    });
    return;
  }

  await interaction.deferUpdate();

  const result = startNextJustOneDiscordRound({
    channelId,
    engine: input.engine,
    registry: input.sessionRegistry,
    random: input.random
  });

  if (result.status !== "started") {
    await interaction.followUp({
      content: "The next round could not be started.",
      ephemeral: true
    });
    return;
  }

  try {
    const threadResult = await createJustOnePrivateHintThreads({
      channelId,
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

        return { threadId: thread.id };
      }
    });

    await interaction.editReply({ components: [] });
    await channel.send(
      threadResult.status === "partialFailure"
        ? createJustOneNextRoundPartialFailureReply(
            result.guesserId,
            result.score,
            result.roundNumber,
            threadResult.createdCount,
            threadResult.failedCount
          )
        : createJustOneNextRoundStartedReply(result.guesserId, result.score, result.roundNumber)
    );

    const progressMessage = await channel.send(
      createJustOneHintProgressMessage(getHintSubmissionProgress(getJustOneState(result.session)))
    );
    input.sessionRegistry.registerHintProgressMessage({
      channelId,
      sessionId: result.session.id,
      messageId: progressMessage.id
    });
  } catch {
    console.error("Failed to start the next Just One round.");
    await interaction.followUp({
      content: "The next round started, but private hint threads could not be created.",
      ephemeral: true
    });
  }
}

function getJustOneRevealMessage(session: JustOneDiscordSession) {
  const state = getJustOneState(session);
  const reveal = getRevealResult(state);

  if (reveal.status !== "ready") {
    return undefined;
  }

  const result = state.result;
  const points = getRoundPoints(state);

  if (state.phase === "roundScored" && result && points !== undefined) {
    return createJustOneRevealMessage({
      ...reveal,
      result,
      points,
      totalScore: state.score,
      roundNumber: state.roundNumber
    });
  }

  return createJustOneRevealMessage(
    result
      ? { ...reveal, result, roundNumber: state.roundNumber }
      : { ...reveal, roundNumber: state.roundNumber }
  );
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
