import { SlashCommandBuilder } from "discord.js";

export const justOneCommand = new SlashCommandBuilder()
  .setName("just-one")
  .setDescription("Play Just One")
  .addSubcommand((subcommand) =>
    subcommand.setName("create").setDescription("Create a Just One game for this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("join").setDescription("Join the Just One game in this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("start").setDescription("Start the Just One game in this channel")
  );
