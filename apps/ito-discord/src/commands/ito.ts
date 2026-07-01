import { SlashCommandBuilder } from "discord.js";

export const itoCommand = new SlashCommandBuilder()
  .setName("ito")
  .setDescription("Play ITO")
  .addSubcommand((subcommand) =>
    subcommand.setName("create").setDescription("Create an ITO session for this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("join").setDescription("Join the ITO session in this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("status").setDescription("Show the ITO session status in this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("ping").setDescription("Check whether the ITO bot is responding")
  );
