import { submitVote, type Engine } from "@boardgame/game-word-wolf";

import type { WordWolfDiscordSession, WordWolfDiscordSessionRegistry } from "./registry.js";

export type SubmitWordWolfVoteResult =
  | Readonly<{ status: "submitted"; session: WordWolfDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "voterNotParticipant" }>
  | Readonly<{ status: "targetNotParticipant" }>
  | Readonly<{ status: "selfVote" }>
  | Readonly<{ status: "alreadyVoted" }>;

export interface SubmitWordWolfVoteInput {
  readonly channelId: string;
  readonly voterPlayerId: string;
  readonly targetPlayerId: string;
  readonly engine: Engine;
  readonly registry: WordWolfDiscordSessionRegistry;
}

export function submitWordWolfVote(input: SubmitWordWolfVoteInput): SubmitWordWolfVoteResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = submitVote({
    engine: input.engine,
    session,
    voterPlayerId: input.voterPlayerId,
    targetPlayerId: input.targetPlayerId
  });

  if (result.status !== "submitted") {
    return result;
  }

  input.registry.register({ channelId: input.channelId, session: result.session });

  return { status: "submitted", session: result.session };
}
