import type { RevealItoDiscordResultResult } from "../session/index.js";

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
  return answer && answer.length > 0 ? answer : "(No answer)";
}
