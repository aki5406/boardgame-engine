import { scoreRound, type Engine } from "@boardgame/game-just-one";

import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type ScoreJustOneRoundResult =
  | Readonly<{ status: "scored"; points: number; session: JustOneDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "invalidState" }>;

export interface ScoreJustOneRoundInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function scoreJustOneRound(input: ScoreJustOneRoundInput): ScoreJustOneRoundResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = scoreRound({ engine: input.engine, session });

  if (result.status === "scored") {
    input.registry.register({ channelId: input.channelId, session: result.session });
  }

  return result;
}
