import { Events } from "discord.js";

import { createBoardgameDiscordClient } from "./client.js";
import { registerBoardgameDiscordAdapters } from "./composition.js";
import { loadBoardgameDiscordConfig } from "./config.js";

export async function startBoardgameDiscordBot(): Promise<void> {
  const config = loadBoardgameDiscordConfig();
  const client = createBoardgameDiscordClient();

  registerBoardgameDiscordAdapters(client);
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord client ready as ${readyClient.user.tag}`);
  });

  await client.login(config.discordBotToken);
}

await startBoardgameDiscordBot().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to start Boardgame Discord bot";

  console.error(message);
  process.exitCode = 1;
});
