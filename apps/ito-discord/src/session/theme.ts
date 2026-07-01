import type { Engine } from "@boardgame/game-ito";
import { createItoThemeSelectedEvent } from "@boardgame/game-ito";

import type { ItoDiscordSession, ItoDiscordSessionRegistry } from "./registry.js";

export type SetItoDiscordThemeResult =
  | Readonly<{ status: "themeSet"; session: ItoDiscordSession; theme: string }>
  | Readonly<{ status: "notFound" }>;

export interface SetItoDiscordThemeInput {
  readonly channelId: string;
  readonly theme: string;
  readonly engine: Engine;
  readonly registry: ItoDiscordSessionRegistry;
}

export function setItoDiscordSessionTheme(
  input: SetItoDiscordThemeInput
): SetItoDiscordThemeResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const theme = input.theme.trim();
  const nextSession = input.engine.applyEvent({
    session,
    event: createItoThemeSelectedEvent(theme)
  });

  input.registry.register({
    channelId: input.channelId,
    session: nextSession
  });

  return {
    status: "themeSet",
    session: nextSession,
    theme
  };
}
