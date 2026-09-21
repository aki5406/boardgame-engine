import { SlashCommandBuilder } from "discord.js";

export const gameCommand = new SlashCommandBuilder()
  .setName("game")
  .setDescription("Browse available board games");
