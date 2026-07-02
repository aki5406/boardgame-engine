import type { RevealItoDiscordResultResult } from "../session/index.js";

export function formatItoRevealMessage(result: RevealItoDiscordResultResult): string {
  if (result.status !== "revealed") {
    throw new Error("Expected a revealed result");
  }

  return [
    "ITO Result",
    "",
    "Submitted:",
    ...result.items.map((item, index) => `${index + 1}. ${item.playerId} - ${item.number}`),
    "",
    `Success: ${result.success ? "✅" : "❌"}`
  ].join("\n");
}
