import { REST, Routes } from "discord.js";

import { wordWolfCommand } from "./commands/index.js";
import { loadWordWolfDiscordCommandRegistrationConfig } from "./config.js";

export async function registerWordWolfDiscordCommands(): Promise<void> {
  const config = loadWordWolfDiscordCommandRegistrationConfig();
  const rest = new REST({ version: "10" }).setToken(config.discordBotToken);

  await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId), {
    body: [wordWolfCommand.toJSON()]
  });

  console.log("Registered /word-wolf guild command");
}

await registerWordWolfDiscordCommands().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to register Discord commands";

  console.error(message);
  process.exitCode = 1;
});
