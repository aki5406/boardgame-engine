import type { ItoDiscordSessionRegistry } from "./registry.js";

export type StartItoDiscordSessionResult =
  | Readonly<{ status: "started"; playerCount: number }>
  | Readonly<{ status: "noPlayers" }>
  | Readonly<{ status: "notFound" }>;

export interface StartItoDiscordSessionInput {
  readonly channelId: string;
  readonly registry: ItoDiscordSessionRegistry;
}

export function startItoDiscordSession(
  input: StartItoDiscordSessionInput
): StartItoDiscordSessionResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const playerCount = session.players.length;

  if (playerCount === 0) {
    return { status: "noPlayers" };
  }

  return {
    status: "started",
    playerCount
  };
}
