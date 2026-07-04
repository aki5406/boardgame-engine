export interface JustOneDiscordConfig {
  readonly discordBotToken: string;
}

export interface JustOneDiscordCommandRegistrationConfig extends JustOneDiscordConfig {
  readonly discordClientId: string;
  readonly discordGuildId: string;
}

export function loadJustOneDiscordConfig(
  env: NodeJS.ProcessEnv = process.env
): JustOneDiscordConfig {
  const discordBotToken = env.DISCORD_BOT_TOKEN;

  if (!discordBotToken) {
    throw new Error("Missing required environment variable: DISCORD_BOT_TOKEN");
  }

  return {
    discordBotToken
  };
}

export function loadJustOneDiscordCommandRegistrationConfig(
  env: NodeJS.ProcessEnv = process.env
): JustOneDiscordCommandRegistrationConfig {
  const baseConfig = loadJustOneDiscordConfig(env);
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
