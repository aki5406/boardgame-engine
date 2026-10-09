import type { Client } from "discord.js";

import { createWordWolfEngine, type Engine, type WordWolfRandom } from "@boardgame/game-word-wolf";

import { registerWordWolfInteractionHandlers } from "./interactions/index.js";
import {
  createWordWolfDiscordSessionRegistry,
  type WordWolfDiscordSessionRegistry
} from "./session/index.js";

export interface WordWolfDiscordAdapter {
  readonly engine: Engine;
  readonly sessionRegistry: WordWolfDiscordSessionRegistry;
}

export interface RegisterWordWolfDiscordAdapterInput {
  readonly engine?: Engine;
  readonly sessionRegistry?: WordWolfDiscordSessionRegistry;
  readonly random?: WordWolfRandom;
}

export function registerWordWolfDiscordAdapter(
  client: Client,
  input: RegisterWordWolfDiscordAdapterInput = {}
): WordWolfDiscordAdapter {
  const engine = input.engine ?? createWordWolfEngine();
  const sessionRegistry = input.sessionRegistry ?? createWordWolfDiscordSessionRegistry();

  registerWordWolfInteractionHandlers(client, {
    engine,
    sessionRegistry,
    random: input.random ?? Math.random
  });

  return { engine, sessionRegistry };
}
