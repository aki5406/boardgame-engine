import { finishGame, type Engine } from "@boardgame/game-just-one";

import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type FinishJustOneGameResult =
  | Readonly<{ status: "finished"; session: JustOneDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "notFinalRound" }>
  | Readonly<{ status: "invalidState" }>;

export interface FinishJustOneGameInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function finishJustOneGame(input: FinishJustOneGameInput): FinishJustOneGameResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = finishGame({ engine: input.engine, session });

  if (result.status === "finished") {
    input.registry.register({ channelId: input.channelId, session: result.session });
  }

  return result;
}
