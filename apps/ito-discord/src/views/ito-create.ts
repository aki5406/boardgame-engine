import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type InteractionReplyOptions
} from "discord.js";

export const ITO_JOIN_BUTTON_CUSTOM_ID = "ito.join";
export const ITO_START_BUTTON_CUSTOM_ID = "ito.start";
export const ITO_ASSIGN_BUTTON_CUSTOM_ID = "ito.assign";

export function createItoCreateButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ITO_JOIN_BUTTON_CUSTOM_ID)
      .setLabel("Join ITO Game")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(ITO_START_BUTTON_CUSTOM_ID)
      .setLabel("Start ITO Game")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(ITO_ASSIGN_BUTTON_CUSTOM_ID)
      .setLabel("Assign Numbers")
      .setStyle(ButtonStyle.Secondary)
  );
}

export function createItoCreatedReply(): InteractionReplyOptions {
  return {
    content: "ITO game created!",
    components: [createItoCreateButtonRow()]
  };
}
