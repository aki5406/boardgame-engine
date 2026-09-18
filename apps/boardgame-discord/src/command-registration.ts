import { Routes } from "discord.js";

import { getBoardgameDiscordCommandData } from "./commands.js";
import type { BoardgameDiscordCommandRegistrationConfig } from "./config.js";

export interface BoardgameDiscordCommandRest {
  readonly put: (
    route: string,
    options: Readonly<{ body: ReturnType<typeof getBoardgameDiscordCommandData> }>
  ) => Promise<unknown>;
}

export interface RegisterBoardgameDiscordCommandsInput {
  readonly config: BoardgameDiscordCommandRegistrationConfig;
  readonly rest: BoardgameDiscordCommandRest;
}

export async function registerBoardgameDiscordCommands(
  input: RegisterBoardgameDiscordCommandsInput
): Promise<void> {
  await input.rest.put(
    Routes.applicationGuildCommands(input.config.discordClientId, input.config.discordGuildId),
    { body: getBoardgameDiscordCommandData() }
  );
}
