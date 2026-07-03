export function createItoAnswersThreadName(theme: string): string {
  const normalizedTheme = theme.trim();
  const prefix = "ITO answers - ";
  const maxThemeLength = 80;
  const shortTheme =
    normalizedTheme.length > maxThemeLength
      ? `${normalizedTheme.slice(0, maxThemeLength - 3)}...`
      : normalizedTheme;

  return `${prefix}${shortTheme}`;
}

export function createItoAnswersThreadIntro(theme: string): string {
  return [
    "ITO 回答スレッド",
    "テーマ:",
    theme,
    "このスレッドに、テーマに対するあなたの回答を書いてください。",
    "数字は絶対に書かないでください。",
    "回答だけ投稿してください。"
  ].join("\n");
}

export function createItoAnswerStatusMessage(
  playerIds: readonly string[],
  threadUrl: string,
  answeredPlayerIds: readonly string[] = []
): string {
  return [
    "回答状況",
    ...playerIds.map(
      (playerId) => `${answeredPlayerIds.includes(playerId) ? "✅" : "⬜"} <@${playerId}>`
    ),
    `回答スレッド:\n${threadUrl}`
  ].join("\n");
}
