import { startVoting, type Engine } from "@boardgame/game-word-wolf";

import type { WordWolfDiscordSession, WordWolfDiscordSessionRegistry } from "./registry.js";

export type StartWordWolfVotingResult =
  | Readonly<{ status: "started"; session: WordWolfDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "notParticipant" }>;

export interface StartWordWolfVotingInput {
  readonly channelId: string;
  readonly playerId: string;
  readonly engine: Engine;
  readonly registry: WordWolfDiscordSessionRegistry;
}

export function startWordWolfVoting(input: StartWordWolfVotingInput): StartWordWolfVotingResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = startVoting({
    engine: input.engine,
    session,
    playerId: input.playerId
  });

  if (result.status !== "started") {
    return result;
  }

  input.registry.register({ channelId: input.channelId, session: result.session });

  return { status: "started", session: result.session };
}
