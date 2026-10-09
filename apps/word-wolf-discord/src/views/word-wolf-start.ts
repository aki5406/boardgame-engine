export function createWordWolfPrivateWordMessage(word: string): string {
  return `Your word: ${word}`;
}

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const WORD_WOLF_START_VOTING_CUSTOM_ID = "word-wolf:start-voting";

export function createWordWolfStartedReply(playerCount: number): {
  readonly content: string;
  readonly components: readonly ActionRowBuilder<ButtonBuilder>[];
} {
  return {
    content: [
      "Word Wolf started.",
      "",
      `Players: ${playerCount}`,
      "Check your private thread for your word and start discussing here."
    ].join("\n"),
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(WORD_WOLF_START_VOTING_CUSTOM_ID)
          .setLabel("Start voting")
          .setStyle(ButtonStyle.Primary)
      )
    ]
  };
}

export function isWordWolfStartVotingCustomId(customId: string): boolean {
  return customId === WORD_WOLF_START_VOTING_CUSTOM_ID;
}

export function createWordWolfVotingStartedReply(): {
  readonly content: string;
  readonly components: readonly [];
} {
  return {
    content: [
      "Voting started.",
      "",
      "Each player gets one vote.",
      "You cannot vote for yourself.",
      "Votes stay hidden until reveal."
    ].join("\n"),
    components: []
  };
}

export function createWordWolfStartPartialFailureReply(
  playerCount: number,
  createdCount: number,
  failedCount: number
): string {
  return [
    "Word Wolf started, but some private word threads could not be created.",
    "",
    `Players: ${playerCount}`,
    `Threads created: ${createdCount}`,
    `Threads failed: ${failedCount}`
  ].join("\n");
}

export function createWordWolfPrivateThreadName(playerId: string): string {
  return `word-wolf-word-${playerId.slice(-4)}`;
}
