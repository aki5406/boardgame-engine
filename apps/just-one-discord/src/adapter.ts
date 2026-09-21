import type { Client } from "discord.js";

import { createJustOneEngine, type Engine, type JustOneRandom } from "@boardgame/game-just-one";

import { registerJustOneInteractionHandlers } from "./interactions/index.js";
import {
  createJustOneDiscordSessionRegistry,
  type JustOneDiscordSessionRegistry
} from "./session/index.js";

export interface JustOneDiscordAdapter {
  readonly engine: Engine;
  readonly sessionRegistry: JustOneDiscordSessionRegistry;
}

export interface RegisterJustOneDiscordAdapterInput {
  readonly engine?: Engine;
  readonly sessionRegistry?: JustOneDiscordSessionRegistry;
  readonly random?: JustOneRandom;
}

export function registerJustOneDiscordAdapter(
  client: Client,
  input: RegisterJustOneDiscordAdapterInput = {}
): JustOneDiscordAdapter {
  const engine = input.engine ?? createJustOneEngine();
  const sessionRegistry = input.sessionRegistry ?? createJustOneDiscordSessionRegistry();

  registerJustOneInteractionHandlers(client, {
    engine,
    sessionRegistry,
    random: input.random ?? Math.random
  });

  return { engine, sessionRegistry };
}
