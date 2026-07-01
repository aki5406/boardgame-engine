export interface ItoDiscordConfig {
  readonly discordBotToken: string;
}

export interface ItoDiscordCommandRegistrationConfig extends ItoDiscordConfig {
  readonly discordClientId: string;
  readonly discordGuildId: string;
}

export function loadItoDiscordConfig(env: NodeJS.ProcessEnv = process.env): ItoDiscordConfig {
  const discordBotToken = env.DISCORD_BOT_TOKEN;

  if (!discordBotToken) {
    throw new Error("Missing required environment variable: DISCORD_BOT_TOKEN");
  }

  return {
    discordBotToken
  };
}

export function loadItoDiscordCommandRegistrationConfig(
  env: NodeJS.ProcessEnv = process.env
): ItoDiscordCommandRegistrationConfig {
  const baseConfig = loadItoDiscordConfig(env);
  const discordClientId = env.DISCORD_CLIENT_ID;
  const discordGuildId = env.DISCORD_GUILD_ID;

  if (!discordClientId) {
    throw new Error("Missing required environment variable: DISCORD_CLIENT_ID");
  }

  if (!discordGuildId) {
    throw new Error("Missing required environment variable: DISCORD_GUILD_ID");
  }

  return {
    ...baseConfig,
    discordClientId,
    discordGuildId
  };
}
