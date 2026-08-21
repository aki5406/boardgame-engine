import { Client, Events, GatewayIntentBits } from "discord.js";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { registerJustOneInteractionHandlers } from "./interactions/index.js";
import { createJustOneDiscordSessionRegistry } from "./session/index.js";

export function createJustOneDiscordClient(): Client {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });
  const engine = createJustOneEngine();
  const sessionRegistry = createJustOneDiscordSessionRegistry();

  registerJustOneInteractionHandlers(client, {
    engine,
    sessionRegistry,
    random: Math.random
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord client ready as ${readyClient.user.tag}`);
  });

  return client;
}
