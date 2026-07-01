import type { ItoDiscordSessionRegistry } from "./registry.js";

export type GetItoDiscordSessionStatusResult =
  | Readonly<{ status: "found"; sessionId: string; playerCount: number }>
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

  return {
    status: "found",
    sessionId: session.id,
    playerCount: session.players.length
  };
}
