import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type InteractionReplyOptions
} from "discord.js";

export const ITO_JOIN_BUTTON_CUSTOM_ID = "ito.join";
export const ITO_START_BUTTON_CUSTOM_ID = "ito.start";
export const ITO_THEME_BUTTON_CUSTOM_ID = "ito.theme";
export const ITO_THEME_MODAL_CUSTOM_ID = "ito.theme.modal";
export const ITO_THEME_TOPIC_INPUT_CUSTOM_ID = "ito.theme.topic";
export const ITO_ASSIGN_BUTTON_CUSTOM_ID = "ito.assign";
export const ITO_ASSIGN_DELIVER_BUTTON_CUSTOM_ID = "ito.assign-deliver";
export const ITO_DELIVER_BUTTON_CUSTOM_ID = "ito.deliver";
export const ITO_DISCUSS_BUTTON_CUSTOM_ID = "ito.discuss";
export const ITO_REVEAL_BUTTON_CUSTOM_ID = "ito.reveal";

export function createItoSetupButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ITO_JOIN_BUTTON_CUSTOM_ID)
      .setLabel("Join ITO Game")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(ITO_START_BUTTON_CUSTOM_ID)
      .setLabel("Start ITO Game")
      .setStyle(ButtonStyle.Secondary)
  );
}

export function createItoProgressionButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ITO_ASSIGN_BUTTON_CUSTOM_ID)
      .setLabel("Assign Numbers")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(ITO_DELIVER_BUTTON_CUSTOM_ID)
      .setLabel("Deliver Numbers")
      .setStyle(ButtonStyle.Secondary)
  );
}

export function createItoThemeButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ITO_THEME_BUTTON_CUSTOM_ID)
      .setLabel("Set Theme")
      .setStyle(ButtonStyle.Secondary)
  );
}

export function createItoAssignButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ITO_ASSIGN_BUTTON_CUSTOM_ID)
      .setLabel("Assign Numbers")
      .setStyle(ButtonStyle.Secondary)
  );
}

export function createItoAssignDeliverButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ITO_ASSIGN_DELIVER_BUTTON_CUSTOM_ID)
      .setLabel("Assign & Deliver Numbers")
      .setStyle(ButtonStyle.Secondary)
  );
}

export function createItoThemeModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(ITO_THEME_MODAL_CUSTOM_ID)
    .setTitle("Set Theme")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(ITO_THEME_TOPIC_INPUT_CUSTOM_ID)
          .setLabel("Theme")
          .setPlaceholder("Favorite convenience store item")
          .setRequired(true)
          .setStyle(TextInputStyle.Short)
      )
    );
}

export function createItoDeliverButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ITO_DELIVER_BUTTON_CUSTOM_ID)
      .setLabel("Deliver Numbers")
      .setStyle(ButtonStyle.Secondary)
  );
}

export function createItoDiscussionButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ITO_DISCUSS_BUTTON_CUSTOM_ID)
      .setLabel("Start Discussion")
      .setStyle(ButtonStyle.Secondary)
  );
}

export function createItoRevealButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ITO_REVEAL_BUTTON_CUSTOM_ID)
      .setLabel("Reveal Result")
      .setStyle(ButtonStyle.Secondary)
  );
}

export function createItoCreatedReply(): InteractionReplyOptions {
  return {
    content: "ITO game created!",
    components: [createItoSetupButtonRow()]
  };
}

export function createItoStartedReply(playerCount: number): InteractionReplyOptions {
  return {
    content: `ITO game started.\nPlayers: ${playerCount}\n\nNext:\nSet the theme.`,
    components: [createItoThemeButtonRow()]
  };
}

export function createItoAssignedReply(playerCount: number): InteractionReplyOptions {
  return {
    content: `ITO numbers assigned.\nPlayers: ${playerCount}`,
    components: [createItoDeliverButtonRow()]
  };
}

export function createItoThemeSetReply(theme: string): InteractionReplyOptions {
  return {
    content: `Theme set.\nTheme:\n${theme}`,
    components: [createItoAssignDeliverButtonRow()]
  };
}

export function createItoAssignedAndDeliveredReply(
  playerCount: number,
  succeeded: number,
  failed: number
): InteractionReplyOptions {
  return {
    content:
      `Numbers assigned and delivered.\nPlayers: ${playerCount}\n` +
      `Delivered:\nSucceeded: ${succeeded}\nFailed: ${failed}`,
    components: [createItoDiscussionButtonRow()]
  };
}

export function createItoDeliveredReply(
  succeeded: number,
  failed: number
): InteractionReplyOptions {
  return {
    content: `ITO numbers delivered.\nSucceeded: ${succeeded}\nFailed: ${failed}`,
    components: [createItoDiscussionButtonRow()]
  };
}

export function createItoDiscussionStartedReply(
  theme: string,
  playerCount: number,
  answerThreadUrl?: string
): InteractionReplyOptions {
  return {
    content:
      `ITO discussion started.\nTheme:\n${theme}\n` +
      `Everyone, discuss without revealing your number.\nPlayers: ${playerCount}\n` +
      (answerThreadUrl ? `Answers thread:\n${answerThreadUrl}\n\n` : "\n") +
      `Next:\n` +
      `${answerThreadUrl ? "Discuss using the answers thread." : "Discuss together without revealing your number."}\n` +
      `When everyone is ready, press Reveal Result.`,
    components: [createItoRevealButtonRow()]
  };
}
