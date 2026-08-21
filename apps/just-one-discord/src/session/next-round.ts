import {
  defaultWords,
  startNextRound,
  type Engine,
  type JustOneRandom,
  type StartNextRoundResult
} from "@boardgame/game-just-one";

import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";
import { getJustOneState } from "./state.js";

export type StartNextJustOneDiscordRoundResult =
  | Readonly<{
      status: "started";
      guesserId: string;
      hintPlayerCount: number;
      score: number;
      session: JustOneDiscordSession;
    }>
  | Readonly<{ status: "notFound" }>
  | Exclude<StartNextRoundResult, Readonly<{ status: "started"; session: JustOneDiscordSession }>>;

export interface StartNextJustOneDiscordRoundInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
  readonly random: JustOneRandom;
  readonly words?: readonly string[];
}

export function startNextJustOneDiscordRound(
  input: StartNextJustOneDiscordRoundInput
): StartNextJustOneDiscordRoundResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = startNextRound({
    engine: input.engine,
    session,
    random: input.random,
    words: input.words ?? defaultWords
  });

  if (result.status !== "started") {
    return result;
  }

  const state = getJustOneState(result.session);

  if (!state.guesserId) {
    return { status: "invalidState" };
  }

  input.registry.clearRoundResources(input.channelId);
  input.registry.register({ channelId: input.channelId, session: result.session });

  return {
    status: "started",
    guesserId: state.guesserId,
    hintPlayerCount: result.session.players.length - 1,
    score: state.score,
    session: result.session
  };
}
