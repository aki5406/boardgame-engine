export interface ItoDiscordConfig {
  readonly discordBotToken: string;
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
