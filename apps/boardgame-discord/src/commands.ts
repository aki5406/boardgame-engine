import { itoCommand } from "@boardgame/ito-discord";
import { justOneCommand } from "@boardgame/just-one-discord";

import { gameCommand } from "./game-command.js";

export type BoardgameDiscordCommandData =
  | ReturnType<typeof gameCommand.toJSON>
  | ReturnType<typeof itoCommand.toJSON>
  | ReturnType<typeof justOneCommand.toJSON>;

export function getBoardgameDiscordCommandData(): readonly BoardgameDiscordCommandData[] {
  return [gameCommand.toJSON(), itoCommand.toJSON(), justOneCommand.toJSON()];
}
