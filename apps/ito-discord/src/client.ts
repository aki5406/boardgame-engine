import { Client, Events, GatewayIntentBits } from "discord.js";

import { createItoEngine } from "@boardgame/game-ito";

import { registerItoInteractionHandlers } from "./interactions/index.js";
import { createItoDiscordSessionRegistry } from "./session/index.js";

export function createItoDiscordClient(): Client {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
  });
  const engine = createItoEngine();
  const sessionRegistry = createItoDiscordSessionRegistry();

  registerItoInteractionHandlers(client, {
    engine,
    sessionRegistry
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord client ready as ${readyClient.user.tag}`);
  });

  return client;
}
