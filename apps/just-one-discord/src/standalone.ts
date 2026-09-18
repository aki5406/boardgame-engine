import { createJustOneDiscordClient } from "./client.js";
import { loadJustOneDiscordConfig } from "./config.js";

export async function startJustOneDiscordAdapter(): Promise<void> {
  const config = loadJustOneDiscordConfig();
  const client = createJustOneDiscordClient();

  await client.login(config.discordBotToken);
}
