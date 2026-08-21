import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import type { JustOneResult } from "@boardgame/game-just-one";

const JUST_ONE_RESULT_CORRECT_CUSTOM_ID = "just-one:result:correct";
const JUST_ONE_RESULT_INCORRECT_CUSTOM_ID = "just-one:result:incorrect";
const JUST_ONE_SCORE_ROUND_CUSTOM_ID = "just-one:score-round";
const JUST_ONE_NEXT_ROUND_CUSTOM_ID = "just-one:next-round";

export interface JustOneRevealMessageInput {
  readonly guesserId: string;
  readonly guess: string;
  readonly secretWord: string;
  readonly result?: JustOneResult;
  readonly points?: number;
  readonly totalScore?: number;
}

export function createJustOneRevealMessage(input: JustOneRevealMessageInput): {
  readonly content: string;
  readonly components: readonly ActionRowBuilder<ButtonBuilder>[];
} {
  const scored = input.points !== undefined && input.totalScore !== undefined;
  const content = [
    scored ? "Round complete" : "Answer revealed",
    `Guesser: <@${input.guesserId}>`,
    `Guess: ${input.guess}`,
    `Secret Word: ${input.secretWord}`,
    ...(input.result ? [`Result: ${formatResult(input.result)}`] : []),
    ...(scored ? [`Points this round: +${input.points}`, `Total score: ${input.totalScore}`] : [])
  ].join("\n");

  if (scored) {
    return {
      content,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(JUST_ONE_NEXT_ROUND_CUSTOM_ID)
            .setLabel("Next round")
            .setStyle(ButtonStyle.Primary)
        )
      ]
    };
  }

  if (input.result) {
    return {
      content,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(JUST_ONE_SCORE_ROUND_CUSTOM_ID)
            .setLabel("Score round")
            .setStyle(ButtonStyle.Primary)
        )
      ]
    };
  }

  return {
    content,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(JUST_ONE_RESULT_CORRECT_CUSTOM_ID)
          .setLabel("Correct")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(JUST_ONE_RESULT_INCORRECT_CUSTOM_ID)
          .setLabel("Incorrect")
          .setStyle(ButtonStyle.Danger)
      )
    ]
  };
}

export function parseJustOneResultCustomId(customId: string): JustOneResult | undefined {
  if (customId === JUST_ONE_RESULT_CORRECT_CUSTOM_ID) {
    return "correct";
  }

  if (customId === JUST_ONE_RESULT_INCORRECT_CUSTOM_ID) {
    return "incorrect";
  }
}

export function isJustOneScoreRoundCustomId(customId: string): boolean {
  return customId === JUST_ONE_SCORE_ROUND_CUSTOM_ID;
}

export function isJustOneNextRoundCustomId(customId: string): boolean {
  return customId === JUST_ONE_NEXT_ROUND_CUSTOM_ID;
}

function formatResult(result: JustOneResult): string {
  return result === "correct" ? "Correct" : "Incorrect";
}
