import { wordWolfGame } from "@boardgame/game-word-wolf";

export const wordWolfDiscordAdapterTargetGameId = wordWolfGame.id;

export {
  registerWordWolfDiscordAdapter,
  type RegisterWordWolfDiscordAdapterInput,
  type WordWolfDiscordAdapter
} from "./adapter.js";
export { createWordWolfDiscordClient } from "./client.js";
export { wordWolfCommand } from "./commands/index.js";
export { startWordWolfDiscordAdapter } from "./standalone.js";
