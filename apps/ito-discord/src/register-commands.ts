import { REST, Routes } from "discord.js";

import { itoCommand } from "./commands/index.js";
import { loadItoDiscordCommandRegistrationConfig } from "./config.js";

export async function registerItoDiscordCommands(): Promise<void> {
  const config = loadItoDiscordCommandRegistrationConfig();
  const rest = new REST({ version: "10" }).setToken(config.discordBotToken);

  await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId), {
    body: [itoCommand.toJSON()]
  });

  console.log("Registered /ito guild command");
}

await registerItoDiscordCommands().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to register Discord commands";

  console.error(message);
  process.exitCode = 1;
});
