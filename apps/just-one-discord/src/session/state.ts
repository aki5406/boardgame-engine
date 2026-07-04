import type { JustOneState } from "@boardgame/game-just-one";

import type { JustOneDiscordSession } from "./registry.js";

export function getJustOneState(session: JustOneDiscordSession): JustOneState {
  return session.state as JustOneState;
}
