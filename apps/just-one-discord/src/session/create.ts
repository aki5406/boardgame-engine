import { createGame, justOneInitialState, type Engine } from "@boardgame/game-just-one";

import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type CreateJustOneDiscordSessionResult =
  | Readonly<{
      status: "created";
      session: JustOneDiscordSession;
    }>
  | Readonly<{
      status: "alreadyExists";
      session: JustOneDiscordSession;
    }>;

export interface CreateJustOneDiscordSessionInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function createJustOneDiscordSessionForChannel(
  input: CreateJustOneDiscordSessionInput
): CreateJustOneDiscordSessionResult {
  const existingSession = input.registry.get(input.channelId);

  if (existingSession) {
    return {
      status: "alreadyExists",
      session: existingSession
    };
  }

  const session = createGame({
    engine: input.engine,
    id: `just-one:${input.channelId}`
  });

  input.registry.register({
    channelId: input.channelId,
    session
  });

  return {
    status: "created",
    session
  };
}

export { justOneInitialState };
