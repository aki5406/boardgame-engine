import { justOneGame } from "@boardgame/game-just-one";

import { createJustOneDiscordClient } from "./client.js";
import { loadJustOneDiscordConfig } from "./config.js";

export const justOneDiscordAdapterTargetGameId = justOneGame.id;

export async function startJustOneDiscordAdapter(): Promise<void> {
  const config = loadJustOneDiscordConfig();
  const client = createJustOneDiscordClient();

  await client.login(config.discordBotToken);
}

await startJustOneDiscordAdapter().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to start Discord adapter";

  console.error(message);
  process.exitCode = 1;
});
