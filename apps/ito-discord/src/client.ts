import { Client, Events, GatewayIntentBits } from "discord.js";

import { registerItoDiscordAdapter } from "./adapter.js";

export function createItoDiscordClient(): Client {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });
  registerItoDiscordAdapter(client);

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord client ready as ${readyClient.user.tag}`);
  });

  return client;
}
