import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import type { JustOneResult } from "@boardgame/game-just-one";

const JUST_ONE_RESULT_CORRECT_CUSTOM_ID = "just-one:result:correct";
const JUST_ONE_RESULT_INCORRECT_CUSTOM_ID = "just-one:result:incorrect";

export interface JustOneRevealMessageInput {
  readonly guesserId: string;
  readonly guess: string;
  readonly secretWord: string;
  readonly result?: JustOneResult;
}

export function createJustOneRevealMessage(input: JustOneRevealMessageInput): {
  readonly content: string;
  readonly components: readonly ActionRowBuilder<ButtonBuilder>[];
} {
  const content = [
    "Answer revealed",
    `Guesser: <@${input.guesserId}>`,
    `Guess: ${input.guess}`,
    `Secret Word: ${input.secretWord}`,
    ...(input.result ? [`Result: ${formatResult(input.result)}`] : [])
  ].join("\n");

  if (input.result) {
    return { content, components: [] };
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

function formatResult(result: JustOneResult): string {
  return result === "correct" ? "Correct" : "Incorrect";
}
