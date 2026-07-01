import { itoInitialState, type Engine } from "@boardgame/game-ito";

import type { ItoDiscordSession, ItoDiscordSessionRegistry } from "./registry.js";

export type CreateItoDiscordSessionResult =
  | Readonly<{
      status: "created";
      session: ItoDiscordSession;
    }>
  | Readonly<{
      status: "alreadyExists";
      session: ItoDiscordSession;
    }>;

export interface CreateItoDiscordSessionInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: ItoDiscordSessionRegistry;
}

export function createItoDiscordSessionForChannel(
  input: CreateItoDiscordSessionInput
): CreateItoDiscordSessionResult {
  const existingSession = input.registry.get(input.channelId);

  if (existingSession) {
    return {
      status: "alreadyExists",
      session: existingSession
    };
  }

  const session = input.engine.startSession({
    id: `ito:${input.channelId}`,
    players: [],
    initialState: itoInitialState
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
