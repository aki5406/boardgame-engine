import { REST, Routes } from "discord.js";

import { justOneCommand } from "./commands/index.js";
import { loadJustOneDiscordCommandRegistrationConfig } from "./config.js";

export async function registerJustOneDiscordCommands(): Promise<void> {
  const config = loadJustOneDiscordCommandRegistrationConfig();
  const rest = new REST({ version: "10" }).setToken(config.discordBotToken);

  await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId), {
    body: [justOneCommand.toJSON()]
  });

  console.log("Registered /just-one guild command");
}

await registerJustOneDiscordCommands().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to register Discord commands";

  console.error(message);
  process.exitCode = 1;
});
