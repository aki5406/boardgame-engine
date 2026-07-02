import type { ItoDiscordSessionRegistry } from "./registry.js";

export type ResetItoDiscordSessionResult =
  | Readonly<{ status: "reset" }>
  | Readonly<{ status: "notFound" }>;

export interface ResetItoDiscordSessionInput {
  readonly channelId: string;
  readonly registry: ItoDiscordSessionRegistry;
}

export function resetItoDiscordSessionForChannel(
  input: ResetItoDiscordSessionInput
): ResetItoDiscordSessionResult {
  const deleted = input.registry.delete(input.channelId);

  if (!deleted) {
    return { status: "notFound" };
  }

  return { status: "reset" };
}
