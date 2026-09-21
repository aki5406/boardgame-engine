import {
  ActionRowBuilder,
  Events,
  StringSelectMenuBuilder,
  type Client,
  type StringSelectMenuInteraction
} from "discord.js";

import { boardgameCatalog, getBoardgameCatalogEntry } from "./catalog.js";

export const BOARDGAME_GAME_SELECT_CUSTOM_ID = "boardgame:game-select";

export function registerBoardgameLauncherInteractionHandlers(client: Client): void {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName !== "game") {
        return;
      }

      await interaction.reply(createBoardgameLauncherReply());
      return;
    }

    if (
      !interaction.isStringSelectMenu() ||
      interaction.customId !== BOARDGAME_GAME_SELECT_CUSTOM_ID
    ) {
      return;
    }

    await handleBoardgameSelection(interaction);
  });
}

export function createBoardgameLauncherReply(): {
  readonly content: string;
  readonly components: readonly ActionRowBuilder<StringSelectMenuBuilder>[];
  readonly ephemeral: true;
} {
  return {
    content: "Board Games\n\nChoose a game to learn how to start.",
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(BOARDGAME_GAME_SELECT_CUSTOM_ID)
          .setPlaceholder("Select a game")
          .addOptions(
            boardgameCatalog.map((entry) => ({
              label: entry.name,
              description: entry.description,
              value: entry.id
            }))
          )
      )
    ],
    ephemeral: true
  };
}

export function createBoardgameDetailsReply(gameId: string): {
  readonly content: string;
  readonly components: readonly [];
} {
  const entry = getBoardgameCatalogEntry(gameId);

  if (!entry) {
    return {
      content: "This game is no longer available.",
      components: []
    };
  }

  return {
    content: [
      entry.name,
      "",
      entry.description,
      "",
      "Start:",
      entry.createCommand,
      "",
      "Join:",
      entry.joinCommand
    ].join("\n"),
    components: []
  };
}

async function handleBoardgameSelection(interaction: StringSelectMenuInteraction): Promise<void> {
  const gameId = interaction.values[0];

  await interaction.update(createBoardgameDetailsReply(gameId ?? ""));
}
