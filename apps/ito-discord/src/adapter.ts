import type { Client } from "discord.js";

import { createItoEngine, type Engine } from "@boardgame/game-ito";

import { registerItoInteractionHandlers } from "./interactions/index.js";
import {
  createItoDiscordSessionRegistry,
  type ItoDiscordSessionRegistry
} from "./session/index.js";

export interface ItoDiscordAdapter {
  readonly engine: Engine;
  readonly sessionRegistry: ItoDiscordSessionRegistry;
}

export interface RegisterItoDiscordAdapterInput {
  readonly engine?: Engine;
  readonly sessionRegistry?: ItoDiscordSessionRegistry;
}

export function registerItoDiscordAdapter(
  client: Client,
  input: RegisterItoDiscordAdapterInput = {}
): ItoDiscordAdapter {
  const engine = input.engine ?? createItoEngine();
  const sessionRegistry = input.sessionRegistry ?? createItoDiscordSessionRegistry();

  registerItoInteractionHandlers(client, { engine, sessionRegistry });

  return { engine, sessionRegistry };
}
