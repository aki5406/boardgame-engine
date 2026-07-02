import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type InteractionReplyOptions
} from "discord.js";

export const ITO_JOIN_BUTTON_CUSTOM_ID = "ito.join";

export function createItoJoinButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ITO_JOIN_BUTTON_CUSTOM_ID)
      .setLabel("Join ITO Game")
      .setStyle(ButtonStyle.Primary)
  );
}

export function createItoCreatedReply(): InteractionReplyOptions {
  return {
    content: "ITO game created!",
    components: [createItoJoinButtonRow()]
  };
}
