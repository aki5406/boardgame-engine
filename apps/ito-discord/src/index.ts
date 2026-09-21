import { itoGame } from "@boardgame/game-ito";

export const itoDiscordAdapterTargetGameId = itoGame.id;

export {
  registerItoDiscordAdapter,
  type ItoDiscordAdapter,
  type RegisterItoDiscordAdapterInput
} from "./adapter.js";
export { createItoDiscordClient } from "./client.js";
export { itoCommand } from "./commands/index.js";
export { startItoDiscordAdapter } from "./standalone.js";
