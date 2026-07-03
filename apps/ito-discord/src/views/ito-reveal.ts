import type { RevealItoDiscordResultResult } from "../session/index.js";

const MAX_REVEAL_ANSWER_LENGTH = 100;

export function formatItoRevealMessage(result: RevealItoDiscordResultResult): string {
  if (result.status !== "revealed") {
    throw new Error("Expected a revealed result");
  }

  return ["ITO Reveal", "", "Numbers:", ...result.items.map(formatRevealedItem)].join("\n");
}

function formatRevealedItem(
  item: Readonly<{ playerId: string; number: number | undefined; answer: string | undefined }>,
  index: number
): string {
  return (
    `${index + 1}. <@${item.playerId}> - ${formatRevealedNumber(item.number)}\n` +
    formatRevealedAnswer(item.answer)
  );
}

function formatRevealedNumber(number: number | undefined): string {
  return number === undefined ? "unknown" : String(number);
}

function formatRevealedAnswer(answer: string | undefined): string {
  if (!answer) {
    return "(No answer)";
  }

  const normalizedAnswer = answer.trim().replace(/\s+/g, " ");

  if (normalizedAnswer.length === 0) {
    return "(No answer)";
  }

  if (normalizedAnswer.length <= MAX_REVEAL_ANSWER_LENGTH) {
    return normalizedAnswer;
  }

  return `${normalizedAnswer.slice(0, MAX_REVEAL_ANSWER_LENGTH - 3)}...`;
}
