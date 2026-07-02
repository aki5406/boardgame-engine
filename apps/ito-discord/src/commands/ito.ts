import { SlashCommandBuilder } from "discord.js";

export const itoCommand = new SlashCommandBuilder()
  .setName("ito")
  .setDescription("Play ITO")
  .addSubcommand((subcommand) =>
    subcommand.setName("assign").setDescription("Assign ITO numbers to joined players")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("create").setDescription("Create an ITO session for this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("deliver").setDescription("Deliver assigned ITO numbers by DM")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("discuss").setDescription("Start the ITO discussion phase")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("help").setDescription("Show available ITO commands")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("join").setDescription("Join the ITO session in this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("reveal").setDescription("Reveal the ITO result for this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("reset").setDescription("Reset the ITO session in this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("status").setDescription("Show the ITO session status in this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("start").setDescription("Start the ITO session in this channel")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("submit")
      .setDescription("Submit the ITO player order")
      .addStringOption((option) =>
        option
          .setName("order")
          .setDescription("Comma-separated Discord user ids in submitted order")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("theme")
      .setDescription("Set the ITO theme for this session")
      .addStringOption((option) =>
        option
          .setName("topic")
          .setDescription("Set the ITO theme for this session")
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("ping").setDescription("Check whether the ITO bot is responding")
  );
