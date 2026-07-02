import type { ItoPhase } from "@boardgame/game-ito";

import { getItoState } from "./ito-state.js";
import type { ItoDiscordSessionRegistry } from "./registry.js";

export type GetItoDiscordSessionStatusResult =
  | Readonly<{
      status: "found";
      phase: ItoPhase;
      themeStatus: "set" | "notSet";
      playerCount: number;
      hintCount: number;
      numbersStatus: "assigned" | "notAssigned";
      orderStatus: "submitted" | "notSubmitted";
    }>
  | Readonly<{ status: "notFound" }>;

export interface GetItoDiscordSessionStatusInput {
  readonly channelId: string;
  readonly registry: ItoDiscordSessionRegistry;
}

export function getItoDiscordSessionStatus(
  input: GetItoDiscordSessionStatusInput
): GetItoDiscordSessionStatusResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const state = getItoState(session);

  return {
    status: "found",
    phase: state.phase,
    themeStatus: state.theme ? "set" : "notSet",
    playerCount: session.players.length,
    hintCount: state.hints?.length ?? 0,
    numbersStatus:
      state.assignedNumbers && state.assignedNumbers.length > 0 ? "assigned" : "notAssigned",
    orderStatus:
      state.submittedOrder && state.submittedOrder.length > 0 ? "submitted" : "notSubmitted"
  };
}
