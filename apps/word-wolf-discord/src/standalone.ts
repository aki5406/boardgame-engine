import { createWordWolfDiscordClient } from "./client.js";
import { loadWordWolfDiscordConfig } from "./config.js";

export async function startWordWolfDiscordAdapter(): Promise<void> {
  const config = loadWordWolfDiscordConfig();
  const client = createWordWolfDiscordClient();

  await client.login(config.discordBotToken);
}
