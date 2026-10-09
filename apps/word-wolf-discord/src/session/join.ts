import { joinGame, type Engine } from "@boardgame/game-word-wolf";

import type { WordWolfDiscordSession, WordWolfDiscordSessionRegistry } from "./registry.js";

export type JoinWordWolfDiscordSessionResult =
  | Readonly<{ status: "joined"; playerCount: number; session: WordWolfDiscordSession }>
  | Readonly<{ status: "alreadyJoined"; session: WordWolfDiscordSession }>
  | Readonly<{ status: "invalidPhase"; session: WordWolfDiscordSession }>
  | Readonly<{ status: "notFound" }>;

export interface JoinWordWolfDiscordSessionInput {
  readonly channelId: string;
  readonly playerId: string;
  readonly engine: Engine;
  readonly registry: WordWolfDiscordSessionRegistry;
}

export function joinWordWolfDiscordSessionForChannel(
  input: JoinWordWolfDiscordSessionInput
): JoinWordWolfDiscordSessionResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = joinGame({
    engine: input.engine,
    session,
    playerId: input.playerId
  });

  if (result.status === "alreadyJoined") {
    return { status: "alreadyJoined", session };
  }

  if (result.status === "invalidPhase") {
    return { status: "invalidPhase", session };
  }

  input.registry.register({ channelId: input.channelId, session: result.session });

  return {
    status: "joined",
    playerCount: result.session.players.length,
    session: result.session
  };
}
