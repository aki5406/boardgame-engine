import { itoGame } from "@boardgame/game-ito";

import { createItoDiscordClient } from "./client.js";
import { loadItoDiscordConfig } from "./config.js";

export const itoDiscordAdapterTargetGameId = itoGame.id;

export async function startItoDiscordAdapter(): Promise<void> {
  const config = loadItoDiscordConfig();
  const client = createItoDiscordClient();

  await client.login(config.discordBotToken);
}

await startItoDiscordAdapter().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to start Discord adapter";

  console.error(message);
  process.exitCode = 1;
});
