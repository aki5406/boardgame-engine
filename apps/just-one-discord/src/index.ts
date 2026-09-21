import { justOneGame } from "@boardgame/game-just-one";

export const justOneDiscordAdapterTargetGameId = justOneGame.id;

export {
  registerJustOneDiscordAdapter,
  type JustOneDiscordAdapter,
  type RegisterJustOneDiscordAdapterInput
} from "./adapter.js";
export { createJustOneDiscordClient } from "./client.js";
export { justOneCommand } from "./commands/index.js";
export { startJustOneDiscordAdapter } from "./standalone.js";
