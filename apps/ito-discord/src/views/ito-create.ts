import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type InteractionReplyOptions
} from "discord.js";

export const ITO_JOIN_BUTTON_CUSTOM_ID = "ito.join";
export const ITO_START_BUTTON_CUSTOM_ID = "ito.start";
export const ITO_ASSIGN_BUTTON_CUSTOM_ID = "ito.assign";
export const ITO_DELIVER_BUTTON_CUSTOM_ID = "ito.deliver";
export const ITO_DISCUSS_BUTTON_CUSTOM_ID = "ito.discuss";

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

export function createItoCreatedReply(): InteractionReplyOptions {
  return {
    content: "ITO game created!",
    components: [createItoSetupButtonRow()]
  };
}

export function createItoStartedReply(playerCount: number): InteractionReplyOptions {
  return {
    content: `ITO game started.\nPlayers: ${playerCount}`,
    components: [createItoProgressionButtonRow()]
  };
}

export function createItoAssignedReply(playerCount: number): InteractionReplyOptions {
  return {
    content: `ITO numbers assigned.\nPlayers: ${playerCount}`,
    components: [createItoDeliverButtonRow()]
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
