import { REST, Routes } from "discord.js";

import { getBoardgameDiscordCommandData } from "./commands.js";
import { loadBoardgameDiscordCommandRegistrationConfig } from "./config.js";

export async function registerBoardgameDiscordCommands(): Promise<void> {
  const config = loadBoardgameDiscordCommandRegistrationConfig();
  const rest = new REST({ version: "10" }).setToken(config.discordBotToken);

  await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId), {
    body: getBoardgameDiscordCommandData()
  });

  console.log("Registered /ito and /just-one guild commands");
}

await registerBoardgameDiscordCommands().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to register Discord commands";

  console.error(message);
  process.exitCode = 1;
});
