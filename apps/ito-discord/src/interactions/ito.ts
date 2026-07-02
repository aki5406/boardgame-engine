import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  ModalSubmitInteraction
} from "discord.js";
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
import {
  ITO_ASSIGN_BUTTON_CUSTOM_ID,
  createItoAssignedReply,
  createItoAssignedAndDeliveredReply,
  createItoCreatedReply,
  createItoDeliveredReply,
  createItoDiscussionStartedReply,
  createItoStartedReply,
  createItoThemeModal,
  createItoThemeSetReply,
  ITO_ASSIGN_DELIVER_BUTTON_CUSTOM_ID,
  ITO_DISCUSS_BUTTON_CUSTOM_ID,
  ITO_DELIVER_BUTTON_CUSTOM_ID,
  ITO_JOIN_BUTTON_CUSTOM_ID,
  ITO_REVEAL_BUTTON_CUSTOM_ID,
  ITO_START_BUTTON_CUSTOM_ID,
  ITO_THEME_BUTTON_CUSTOM_ID,
  ITO_THEME_MODAL_CUSTOM_ID,
  ITO_THEME_TOPIC_INPUT_CUSTOM_ID
} from "../views/ito-create.js";
import { formatItoHelpMessage } from "../views/ito-help.js";
import { formatItoRevealMessage } from "../views/ito-reveal.js";
import { formatItoStatusMessage } from "../views/ito-status.js";

export interface RegisterItoInteractionHandlersInput {
  readonly engine: Engine;
  readonly sessionRegistry: ItoDiscordSessionRegistry;
}

type ItoButtonHandler = (
  interaction: ButtonInteraction,
  input: RegisterItoInteractionHandlersInput
) => Promise<void>;

export function registerItoInteractionHandlers(
  client: Client,
  input: RegisterItoInteractionHandlersInput
): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      await handleItoButton(interaction, input);
      return;
    }

    if (interaction.isModalSubmit()) {
      await handleItoModalSubmit(interaction, input);
      return;
    }

    if (!interaction.isChatInputCommand()) {
      return;
    }

    if (interaction.commandName !== "ito") {
      return;
    }

    await handleItoCommand(interaction, input);
  });
}

async function handleItoButton(
  interaction: ButtonInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
  const buttonHandler = itoButtonHandlers[interaction.customId];

  if (!buttonHandler) {
    return;
  }

  await buttonHandler(interaction, input);
}

async function handleItoModalSubmit(
  interaction: ModalSubmitInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
  if (interaction.customId !== ITO_THEME_MODAL_CUSTOM_ID) {
    return;
  }

  if (!interaction.channelId) {
    await interaction.reply("No ITO game exists in this channel. Use /ito create first.");
    return;
  }

  const topic = interaction.fields.getTextInputValue(ITO_THEME_TOPIC_INPUT_CUSTOM_ID);
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

  await interaction.reply(createItoThemeSetReply(result.theme));
}

async function handleItoCommand(
  interaction: ChatInputCommandInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
  const subcommand = interaction.options.getSubcommand(false);

  if (subcommand === "assign") {
    await handleItoAssign(interaction, input);
    return;
  }

  if (subcommand === "deliver") {
    await handleItoDeliver(interaction, input);
    return;
  }

  if (subcommand === "discuss") {
    await handleItoDiscuss(interaction, input);
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

    await interaction.reply(createItoCreatedReply());
    return;
  }

  if (subcommand === "join") {
    await handleItoJoin(interaction, input);
    return;
  }

  if (subcommand === "reveal") {
    await handleItoReveal(interaction, input);
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
    await handleItoStart(interaction, input);
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

    await interaction.reply(createItoThemeSetReply(result.theme));
  }
}

async function handleItoJoin(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
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
}

async function handleItoStart(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
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

  await interaction.reply(createItoStartedReply(result.playerCount));
}

async function handleItoAssign(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
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

  await interaction.reply(createItoAssignedReply(result.playerCount));
}

async function handleItoAssignDeliver(
  interaction: ButtonInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
  const assignResult = assignItoDiscordNumbers({
    channelId: interaction.channelId,
    engine: input.engine,
    registry: input.sessionRegistry
  });

  if (assignResult.status === "notFound") {
    await interaction.reply("No ITO game exists in this channel. Use /ito create first.");
    return;
  }

  if (assignResult.status === "noPlayers") {
    await interaction.reply("No players have joined this ITO game. Use /ito join first.");
    return;
  }

  const deliverResult = await deliverItoDiscordNumbers({
    channelId: interaction.channelId,
    registry: input.sessionRegistry,
    sendDirectMessage: async ({ playerId, message }) => {
      const user = await interaction.client.users.fetch(playerId);
      await user.send(message);
    }
  });

  if (deliverResult.status === "notFound") {
    await interaction.reply("No ITO game exists in this channel. Use /ito create first.");
    return;
  }

  if (deliverResult.status === "notAssigned") {
    await interaction.reply("No ITO numbers have been assigned yet. Use /ito assign first.");
    return;
  }

  await interaction.reply(
    createItoAssignedAndDeliveredReply(
      assignResult.playerCount,
      deliverResult.succeeded,
      deliverResult.failed
    )
  );
}

async function handleItoThemeButton(interaction: ButtonInteraction): Promise<void> {
  await interaction.showModal(createItoThemeModal());
}

async function handleItoDeliver(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
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

  await interaction.reply(createItoDeliveredReply(result.succeeded, result.failed));
}

async function handleItoDiscuss(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
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

  await interaction.reply(createItoDiscussionStartedReply(result.theme, result.playerCount));
}

async function handleItoReveal(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  input: RegisterItoInteractionHandlersInput
): Promise<void> {
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

  await interaction.reply(formatItoRevealMessage(result));
}

const itoButtonHandlers: Readonly<Record<string, ItoButtonHandler>> = {
  [ITO_JOIN_BUTTON_CUSTOM_ID]: handleItoJoin,
  [ITO_START_BUTTON_CUSTOM_ID]: handleItoStart,
  [ITO_THEME_BUTTON_CUSTOM_ID]: handleItoThemeButton,
  [ITO_ASSIGN_DELIVER_BUTTON_CUSTOM_ID]: handleItoAssignDeliver,
  [ITO_ASSIGN_BUTTON_CUSTOM_ID]: handleItoAssign,
  [ITO_DELIVER_BUTTON_CUSTOM_ID]: handleItoDeliver,
  [ITO_DISCUSS_BUTTON_CUSTOM_ID]: handleItoDiscuss,
  [ITO_REVEAL_BUTTON_CUSTOM_ID]: handleItoReveal
};
