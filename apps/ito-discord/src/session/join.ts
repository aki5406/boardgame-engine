import type { Engine } from "@boardgame/game-ito";

import type { ItoDiscordSession, ItoDiscordSessionRegistry } from "./registry.js";

export type JoinItoDiscordSessionResult =
  | Readonly<{ status: "joined"; session: ItoDiscordSession }>
  | Readonly<{ status: "alreadyJoined"; session: ItoDiscordSession }>
  | Readonly<{ status: "notFound" }>;

export interface JoinItoDiscordSessionInput {
  readonly channelId: string;
  readonly playerId: string;
  readonly engine: Engine;
  readonly registry: ItoDiscordSessionRegistry;
}

export function joinItoDiscordSessionForChannel(
  input: JoinItoDiscordSessionInput
): JoinItoDiscordSessionResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  if (session.players.some((player) => player.id === input.playerId)) {
    return { status: "alreadyJoined", session };
  }

  const nextSession = input.engine.startSession({
    id: session.id,
    players: [...session.players, { id: input.playerId }],
    initialState: session.state
  });

  input.registry.register({
    channelId: input.channelId,
    session: nextSession
  });

  return { status: "joined", session: nextSession };
}
