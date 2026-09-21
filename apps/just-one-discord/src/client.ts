import { Client, Events, GatewayIntentBits } from "discord.js";

import { registerJustOneDiscordAdapter } from "./adapter.js";

export function createJustOneDiscordClient(): Client {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });
  registerJustOneDiscordAdapter(client);

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord client ready as ${readyClient.user.tag}`);
  });

  return client;
}
