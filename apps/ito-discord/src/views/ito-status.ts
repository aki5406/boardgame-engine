import type { GetItoDiscordSessionStatusResult } from "../session/index.js";

export function formatItoStatusMessage(result: GetItoDiscordSessionStatusResult): string {
  if (result.status === "notFound") {
    return "No ITO game exists in this channel.";
  }

  return `ITO game status\nPhase: ${result.phase}\nTheme: ${formatThemeStatus(result.themeStatus)}\nPlayers: ${result.playerCount}\n${formatPlayerIds(result.playerIds)}\nHints: ${result.hintCount}\nNumbers: ${formatNumbersStatus(result.numbersStatus)}\nOrder: ${formatOrderStatus(result.orderStatus)}\nResult: ${formatResultStatus(result.resultStatus)}${formatSubmitExample(result.playerIds)}`;
}

function formatOrderStatus(orderStatus: "submitted" | "notSubmitted"): string {
  return orderStatus === "submitted" ? "submitted" : "not submitted";
}

function formatThemeStatus(themeStatus: "set" | "notSet"): string {
  return themeStatus === "set" ? "set" : "not set";
}

function formatNumbersStatus(numbersStatus: "assigned" | "notAssigned"): string {
  return numbersStatus === "assigned" ? "assigned" : "not assigned";
}

function formatResultStatus(resultStatus: "failure" | "notRevealed" | "success"): string {
  if (resultStatus === "success") {
    return "success";
  }

  if (resultStatus === "failure") {
    return "failure";
  }

  return "not revealed";
}

function formatPlayerIds(playerIds: readonly string[]): string {
  if (playerIds.length === 0) {
    return "Player IDs: none";
  }

  return ["Player IDs:", ...playerIds.map((playerId) => `- ${playerId}`)].join("\n");
}

function formatSubmitExample(playerIds: readonly string[]): string {
  if (playerIds.length === 0) {
    return "";
  }

  return `\nSubmit example:\n/ito submit order:"${playerIds.join(",")}"`;
}
