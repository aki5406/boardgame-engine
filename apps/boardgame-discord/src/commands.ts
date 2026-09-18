import { itoCommand } from "@boardgame/ito-discord";
import { justOneCommand } from "@boardgame/just-one-discord";

export function getBoardgameDiscordCommandData(): readonly ReturnType<typeof itoCommand.toJSON>[] {
  return [itoCommand.toJSON(), justOneCommand.toJSON()];
}
