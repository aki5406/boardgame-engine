import { SlashCommandBuilder } from "discord.js";

export const wordWolfCommand = new SlashCommandBuilder()
  .setName("word-wolf")
  .setDescription("Play Word Wolf")
  .addSubcommand((subcommand) =>
    subcommand.setName("create").setDescription("Create a Word Wolf game for this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("join").setDescription("Join the Word Wolf game in this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("start").setDescription("Start the Word Wolf game in this channel")
  );
