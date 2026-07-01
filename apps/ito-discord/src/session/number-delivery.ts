import type { ItoAssignedNumber, ItoState } from "@boardgame/game-ito";

import type { ItoDiscordSessionRegistry } from "./registry.js";

export type ItoNumberDeliveryItem = Readonly<{
  playerId: string;
  number: number;
}>;

export type GetItoNumberDeliveryViewResult =
  | Readonly<{ status: "ready"; items: readonly ItoNumberDeliveryItem[] }>
  | Readonly<{ status: "notAssigned" }>
  | Readonly<{ status: "notFound" }>;

export interface GetItoNumberDeliveryViewInput {
  readonly channelId: string;
  readonly registry: ItoDiscordSessionRegistry;
}

export function getItoNumberDeliveryView(
  input: GetItoNumberDeliveryViewInput
): GetItoNumberDeliveryViewResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const assignedNumbers = (session.state as ItoState).assignedNumbers;

  if (!assignedNumbers || assignedNumbers.length === 0) {
    return { status: "notAssigned" };
  }

  return {
    status: "ready",
    items: assignedNumbers.map(toDeliveryItem)
  };
}

function toDeliveryItem(assignedNumber: ItoAssignedNumber): ItoNumberDeliveryItem {
  return {
    playerId: assignedNumber.playerId,
    number: assignedNumber.number
  };
}
