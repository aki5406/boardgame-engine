import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from "discord.js";

export const WORD_WOLF_START_VOTING_CUSTOM_ID = "word-wolf:start-voting";
export const WORD_WOLF_VOTE_CUSTOM_ID = "word-wolf:vote";

export interface WordWolfVotingViewInput {
  readonly playerIds: readonly string[];
  readonly submittedVotes: number;
  readonly totalVotes: number;
  readonly complete: boolean;
}

export function createWordWolfPrivateWordMessage(word: string): string {
  return `Your word: ${word}`;
}

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

export function isWordWolfVoteCustomId(customId: string): boolean {
  return customId === WORD_WOLF_VOTE_CUSTOM_ID;
}

export function createWordWolfVotingStartedReply(input: WordWolfVotingViewInput): {
  readonly content: string;
  readonly components: readonly ActionRowBuilder<StringSelectMenuBuilder>[];
} {
  return {
    content: [
      "Voting started.",
      "",
      "Each player gets one vote.",
      "You cannot vote for yourself.",
      "Votes stay hidden until reveal.",
      "",
      `Votes: ${input.submittedVotes} / ${input.totalVotes}`,
      ...(input.complete ? ["All votes are in."] : [])
    ].join("\n"),
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(WORD_WOLF_VOTE_CUSTOM_ID)
          .setPlaceholder("Choose a player to vote for")
          .setDisabled(input.complete)
          .addOptions(
            input.playerIds.map((playerId) => ({
              label: playerId,
              value: playerId
            }))
          )
      )
    ]
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
