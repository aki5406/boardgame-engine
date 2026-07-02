import type { Engine } from "@boardgame/game-ito";
import type { ItoAssignedNumber } from "@boardgame/game-ito";

import { getItoState } from "./ito-state.js";
import type { ItoDiscordSession, ItoDiscordSessionRegistry } from "./registry.js";

export type ItoRevealedOrderItem = Readonly<{
  playerId: string;
  number: number | undefined;
}>;

export type RevealItoDiscordResultResult =
  | Readonly<{
      status: "revealed";
      session: ItoDiscordSession;
      items: readonly ItoRevealedOrderItem[];
    }>
  | Readonly<{ status: "notAssigned" }>
  | Readonly<{ status: "notFound" }>;

export interface RevealItoDiscordResultInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: ItoDiscordSessionRegistry;
}

export function revealItoDiscordResult(
  input: RevealItoDiscordResultInput
): RevealItoDiscordResultResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const state = getItoState(session);
  const assignedNumbers = state.assignedNumbers;

  if (!assignedNumbers || assignedNumbers.length === 0) {
    return { status: "notAssigned" };
  }

  const submittedOrder = state.submittedOrder;
  const playerIds =
    submittedOrder && submittedOrder.length > 0
      ? submittedOrder
      : assignedNumbers.map((assignment) => assignment.playerId);

  return {
    status: "revealed",
    session,
    items: playerIds.map((playerId) => toRevealedOrderItem(playerId, assignedNumbers))
  };
}

function toRevealedOrderItem(
  playerId: string,
  assignedNumbers: readonly ItoAssignedNumber[]
): ItoRevealedOrderItem {
  const assignment = assignedNumbers.find((item) => item.playerId === playerId);

  return {
    playerId,
    number: assignment?.number
  };
}
