import { joinGame, type Engine } from "@boardgame/game-just-one";

import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type JoinJustOneDiscordSessionResult =
  | Readonly<{ status: "joined"; playerCount: number; session: JustOneDiscordSession }>
  | Readonly<{ status: "alreadyJoined"; session: JustOneDiscordSession }>
  | Readonly<{ status: "notFound" }>;

export interface JoinJustOneDiscordSessionInput {
  readonly channelId: string;
  readonly playerId: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function joinJustOneDiscordSessionForChannel(
  input: JoinJustOneDiscordSessionInput
): JoinJustOneDiscordSessionResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  if (session.players.some((player) => player.id === input.playerId)) {
    return { status: "alreadyJoined", session };
  }

  const nextSession = joinGame({
    engine: input.engine,
    session,
    playerId: input.playerId
  });

  input.registry.register({
    channelId: input.channelId,
    session: nextSession
  });

  return {
    status: "joined",
    playerCount: nextSession.players.length,
    session: nextSession
  };
}
