import type { Engine } from "@boardgame/game-ito";
import { judgeItoOrder, type ItoAssignedNumber } from "@boardgame/game-ito";

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
      success: boolean;
    }>
  | Readonly<{ status: "notAssigned" }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "notSubmitted" }>;

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

  if (!submittedOrder || submittedOrder.length === 0) {
    return { status: "notSubmitted" };
  }

  const resultEvent = judgeItoOrder({
    assignedNumbers,
    submittedOrder
  });
  const nextSession = input.engine.applyEvent({
    session,
    event: resultEvent
  });

  input.registry.register({
    channelId: input.channelId,
    session: nextSession
  });

  return {
    status: "revealed",
    session: nextSession,
    items: submittedOrder.map((playerId) => toRevealedOrderItem(playerId, assignedNumbers)),
    success: resultEvent.success
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
