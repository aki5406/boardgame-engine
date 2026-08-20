import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";

const JUST_ONE_SUBMIT_GUESS_CUSTOM_ID = "just-one:submit-guess";
const JUST_ONE_GUESS_MODAL_CUSTOM_ID = "just-one:guess-modal";
const JUST_ONE_GUESS_TEXT_INPUT_CUSTOM_ID = "just-one:guess";

export interface JustOneGuessingHintsMessageInput {
  readonly guesserId: string;
  readonly hints: readonly string[];
}

export interface JustOneGuessingHintsMessage {
  readonly content: string;
  readonly components: readonly ActionRowBuilder<ButtonBuilder>[];
}

export function createJustOneGuessingHintsMessage(
  input: JustOneGuessingHintsMessageInput
): JustOneGuessingHintsMessage {
  const hintLines =
    input.hints.length === 0 ? ["No hints remain."] : input.hints.map((hint) => `- ${hint}`);

  return {
    content: [
      `Hints for <@${input.guesserId}>`,
      "",
      ...hintLines,
      "",
      input.hints.length === 0
        ? "Guesser, make your best guess."
        : "Guesser, submit your answer when ready."
    ].join("\n"),
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(createJustOneSubmitGuessCustomId())
          .setLabel("Answer")
          .setStyle(ButtonStyle.Primary)
      )
    ]
  };
}

export function createJustOneSubmitGuessCustomId(): string {
  return JUST_ONE_SUBMIT_GUESS_CUSTOM_ID;
}

export function isJustOneSubmitGuessCustomId(customId: string): boolean {
  return customId === JUST_ONE_SUBMIT_GUESS_CUSTOM_ID;
}

export function createJustOneGuessModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId(JUST_ONE_GUESS_MODAL_CUSTOM_ID)
    .setTitle("Submit your guess")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(JUST_ONE_GUESS_TEXT_INPUT_CUSTOM_ID)
          .setLabel("Your guess")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100)
      )
    );
}

export function isJustOneGuessModalCustomId(customId: string): boolean {
  return customId === JUST_ONE_GUESS_MODAL_CUSTOM_ID;
}

export function getJustOneGuessTextInputCustomId(): string {
  return JUST_ONE_GUESS_TEXT_INPUT_CUSTOM_ID;
}
