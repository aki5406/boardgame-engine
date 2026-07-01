import { Client, Events, GatewayIntentBits } from "discord.js";

import { registerItoInteractionHandlers } from "./interactions/index.js";

export function createItoDiscordClient(): Client {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });

  registerItoInteractionHandlers(client);

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord client ready as ${readyClient.user.tag}`);
  });

  return client;
}
