import { REST } from "discord.js";

import {
  registerBoardgameDiscordCommands,
  type BoardgameDiscordCommandRest
} from "./command-registration.js";
import { loadBoardgameDiscordCommandRegistrationConfig } from "./config.js";

async function runBoardgameDiscordCommandRegistration(): Promise<void> {
  const config = loadBoardgameDiscordCommandRegistrationConfig();
  const rest = new REST({ version: "10" }).setToken(config.discordBotToken);

  await registerBoardgameDiscordCommands({
    config,
    rest: rest as BoardgameDiscordCommandRest
  });

  console.log("Registered /ito and /just-one guild commands");
}

await runBoardgameDiscordCommandRegistration().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to register Discord commands";

  console.error(message);
  process.exitCode = 1;
});
