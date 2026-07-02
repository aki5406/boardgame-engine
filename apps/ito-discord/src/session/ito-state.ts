import type { ItoState } from "@boardgame/game-ito";

import type { ItoDiscordSession } from "./registry.js";

export function getItoState(session: ItoDiscordSession): ItoState {
  return session.state as ItoState;
}
