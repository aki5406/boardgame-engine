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
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("thread-poc")
      .setDescription("Create a private hint thread PoC for one player")
      .addUserOption((option) =>
        option.setName("player").setDescription("Hint player to invite").setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("word")
          .setDescription("Secret word to post in the private thread")
          .setRequired(false)
      )
  );
