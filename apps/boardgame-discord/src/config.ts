export interface BoardgameDiscordConfig {
  readonly discordBotToken: string;
}

export interface BoardgameDiscordCommandRegistrationConfig extends BoardgameDiscordConfig {
  readonly discordClientId: string;
  readonly discordGuildId: string;
}

export function loadBoardgameDiscordConfig(
  env: NodeJS.ProcessEnv = process.env
): BoardgameDiscordConfig {
  const discordBotToken = env.DISCORD_BOT_TOKEN;

  if (!discordBotToken) {
    throw new Error("Missing required environment variable: DISCORD_BOT_TOKEN");
  }

  return { discordBotToken };
}

export function loadBoardgameDiscordCommandRegistrationConfig(
  env: NodeJS.ProcessEnv = process.env
): BoardgameDiscordCommandRegistrationConfig {
  const baseConfig = loadBoardgameDiscordConfig(env);
  const discordClientId = env.DISCORD_CLIENT_ID;
  const discordGuildId = env.DISCORD_GUILD_ID;

  if (!discordClientId) {
    throw new Error("Missing required environment variable: DISCORD_CLIENT_ID");
  }

  if (!discordGuildId) {
    throw new Error("Missing required environment variable: DISCORD_GUILD_ID");
  }

  return { ...baseConfig, discordClientId, discordGuildId };
}
