import { confirmResult, type Engine, type JustOneResult } from "@boardgame/game-just-one";

import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type ConfirmJustOneResultResult =
  | Readonly<{ status: "confirmed"; session: JustOneDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "invalidState" }>;

export interface ConfirmJustOneResultInput {
  readonly channelId: string;
  readonly result: JustOneResult;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function confirmJustOneResult(input: ConfirmJustOneResultInput): ConfirmJustOneResultResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = confirmResult({
    engine: input.engine,
    session,
    result: input.result
  });

  if (result.status === "confirmed") {
    input.registry.register({ channelId: input.channelId, session: result.session });
  }

  return result;
}
