import { resetForRematch, type Engine } from "@boardgame/game-just-one";

import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type ResetJustOneDiscordSessionForRematchResult =
  | Readonly<{ status: "reset"; session: JustOneDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "invalidState" }>;

export interface ResetJustOneDiscordSessionForRematchInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function resetJustOneDiscordSessionForRematch(
  input: ResetJustOneDiscordSessionForRematchInput
): ResetJustOneDiscordSessionForRematchResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = resetForRematch({ engine: input.engine, session });

  if (result.status === "reset") {
    input.registry.clearRoundResources(input.channelId);
    input.registry.register({ channelId: input.channelId, session: result.session });
  }

  return result;
}
