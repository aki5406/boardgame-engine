import type { RevealItoDiscordResultResult } from "../session/index.js";

export function formatItoRevealMessage(result: RevealItoDiscordResultResult): string {
  if (result.status !== "revealed") {
    throw new Error("Expected a revealed result");
  }

  return [
    "ITO Result",
    "",
    "Submitted:",
    ...result.items.map(
      (item, index) => `${index + 1}. ${item.playerId} - ${formatRevealedNumber(item.number)}`
    ),
    "",
    `Success: ${result.success ? "✅" : "❌"}`
  ].join("\n");
}

function formatRevealedNumber(number: number | undefined): string {
  return number === undefined ? "unknown" : String(number);
}
