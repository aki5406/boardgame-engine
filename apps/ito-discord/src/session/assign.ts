import type { Engine, ItoNumbersAssignedEvent } from "@boardgame/game-ito";
import { createItoNumberAssignments } from "@boardgame/game-ito";

import type { ItoDiscordSession, ItoDiscordSessionRegistry } from "./registry.js";

export type AssignItoDiscordNumbersResult =
  | Readonly<{ status: "numbersAssigned"; session: ItoDiscordSession; playerCount: number }>
  | Readonly<{ status: "noPlayers" }>
  | Readonly<{ status: "notFound" }>;

export interface AssignItoDiscordNumbersInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: ItoDiscordSessionRegistry;
}

export function assignItoDiscordNumbers(
  input: AssignItoDiscordNumbersInput
): AssignItoDiscordNumbersResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const playerIds = session.players.map((player) => player.id);

  if (playerIds.length === 0) {
    return { status: "noPlayers" };
  }

  const assignments = createItoNumberAssignments({
    playerIds,
    numbers: playerIds.map((_, index) => index + 1)
  });
  const event: ItoNumbersAssignedEvent = {
    type: "ito.numbersAssigned",
    assignments
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
    status: "numbersAssigned",
    session: nextSession,
    playerCount: assignments.length
  };
}
