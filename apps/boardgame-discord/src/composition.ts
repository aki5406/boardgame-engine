import type { Client } from "discord.js";

import { registerItoDiscordAdapter, type ItoDiscordAdapter } from "@boardgame/ito-discord";
import {
  registerJustOneDiscordAdapter,
  type JustOneDiscordAdapter
} from "@boardgame/just-one-discord";

export interface BoardgameDiscordAdapters {
  readonly ito: ItoDiscordAdapter;
  readonly justOne: JustOneDiscordAdapter;
}

export function registerBoardgameDiscordAdapters(client: Client): BoardgameDiscordAdapters {
  return {
    ito: registerItoDiscordAdapter(client),
    justOne: registerJustOneDiscordAdapter(client)
  };
}
