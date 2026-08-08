import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import {
  getDuplicateReviewHints,
  type JustOneDuplicateReviewHint,
  type JustOneState
} from "@boardgame/game-just-one";

const JUST_ONE_HINT_TOGGLE_PREFIX = "just-one:hint-toggle:";

export interface JustOneDuplicateReviewMessage {
  readonly content: string;
  readonly components: readonly ActionRowBuilder<ButtonBuilder>[];
}

export function createJustOneDuplicateReviewThreadName(): string {
  return "just-one-duplicate-review";
}

export function createJustOneDuplicateReviewMessage(
  state: JustOneState
): JustOneDuplicateReviewMessage {
  const hints = getDuplicateReviewHints(state);

  return {
    content: createJustOneDuplicateReviewContent(hints),
    components: createJustOneDuplicateReviewButtonRows(hints)
  };
}

export function createJustOneDuplicateReviewContent(
  hints: readonly JustOneDuplicateReviewHint[]
): string {
  return [
    "Duplicate review",
    "",
    "Review the submitted hints and remove duplicates.",
    "",
    ...hints.map((hint, index) =>
      hint.excluded ? `${index + 1}. ${hint.hint} [Removed]` : `${index + 1}. ${hint.hint}`
    )
  ].join("\n");
}

export function createJustOneDuplicateReviewButtonRows(
  hints: readonly JustOneDuplicateReviewHint[]
): readonly ActionRowBuilder<ButtonBuilder>[] {
  const buttons = hints.map((hint, index) =>
    new ButtonBuilder()
      .setCustomId(createJustOneHintToggleCustomId(hint.playerId))
      .setLabel(`${index + 1}: ${hint.excluded ? "Restore" : "Remove"}`)
      .setStyle(hint.excluded ? ButtonStyle.Secondary : ButtonStyle.Danger)
  );

  return chunk(buttons, 5).map((buttonRow) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(buttonRow)
  );
}

export function createJustOneHintToggleCustomId(playerId: string): string {
  return `${JUST_ONE_HINT_TOGGLE_PREFIX}${playerId}`;
}

export function parseJustOneHintToggleCustomId(customId: string): string | undefined {
  if (!customId.startsWith(JUST_ONE_HINT_TOGGLE_PREFIX)) {
    return undefined;
  }

  const playerId = customId.slice(JUST_ONE_HINT_TOGGLE_PREFIX.length);

  return playerId.length > 0 ? playerId : undefined;
}

export function createJustOneDuplicateReviewFailureReply(): string {
  return "All hints were submitted, but duplicate review could not be started.";
}

function chunk<T>(items: readonly T[], size: number): readonly T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
