export interface WordWolfDiscordConfig {
  readonly discordBotToken: string;
}

export interface WordWolfDiscordCommandRegistrationConfig extends WordWolfDiscordConfig {
  readonly discordClientId: string;
  readonly discordGuildId: string;
}

export function loadWordWolfDiscordConfig(
  env: NodeJS.ProcessEnv = process.env
): WordWolfDiscordConfig {
  const discordBotToken = env.DISCORD_BOT_TOKEN;

  if (!discordBotToken) {
    throw new Error("Missing required environment variable: DISCORD_BOT_TOKEN");
  }

  return { discordBotToken };
}

export function loadWordWolfDiscordCommandRegistrationConfig(
  env: NodeJS.ProcessEnv = process.env
): WordWolfDiscordCommandRegistrationConfig {
  const baseConfig = loadWordWolfDiscordConfig(env);
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
