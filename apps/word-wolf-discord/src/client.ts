import { Client, Events, GatewayIntentBits } from "discord.js";

import { registerWordWolfDiscordAdapter } from "./adapter.js";

export function createWordWolfDiscordClient(): Client {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });
  registerWordWolfDiscordAdapter(client);

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord client ready as ${readyClient.user.tag}`);
  });

  return client;
}
