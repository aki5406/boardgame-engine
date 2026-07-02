import type { Engine, ItoOrderSubmittedEvent } from "@boardgame/game-ito";

import type { ItoDiscordSession, ItoDiscordSessionRegistry } from "./registry.js";

export type SubmitItoDiscordOrderResult =
  | Readonly<{ status: "submitted"; session: ItoDiscordSession; playerCount: number }>
  | Readonly<{ status: "emptyOrder" }>
  | Readonly<{ status: "notFound" }>;

export interface SubmitItoDiscordOrderInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly order: string;
  readonly registry: ItoDiscordSessionRegistry;
}

export function submitItoDiscordOrder(
  input: SubmitItoDiscordOrderInput
): SubmitItoDiscordOrderResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const playerIds = parseSubmittedOrder(input.order);

  if (playerIds.length === 0) {
    return { status: "emptyOrder" };
  }

  const event: ItoOrderSubmittedEvent = {
    type: "ito.orderSubmitted",
    playerIds
  };
  const nextSession = input.engine.applyEvent({
    session,
    event
  });

  input.registry.register({
    channelId: input.channelId,
    session: nextSession
  });

  return {
    status: "submitted",
    session: nextSession,
    playerCount: playerIds.length
  };
}

function parseSubmittedOrder(order: string): readonly string[] {
  return order
    .split(",")
    .map((playerId) => playerId.trim())
    .filter((playerId) => playerId.length > 0);
}
