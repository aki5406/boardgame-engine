import { createItoDiscordClient } from "./client.js";
import { loadItoDiscordConfig } from "./config.js";

export async function startItoDiscordAdapter(): Promise<void> {
  const config = loadItoDiscordConfig();
  const client = createItoDiscordClient();

  await client.login(config.discordBotToken);
}
