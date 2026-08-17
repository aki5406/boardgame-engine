import { submitGuess, type Engine } from "@boardgame/game-just-one";

import type { JustOneDiscordSession, JustOneDiscordSessionRegistry } from "./registry.js";

export type SubmitJustOneGuessResult =
  | Readonly<{ status: "submitted"; session: JustOneDiscordSession }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "notPlayer" }>
  | Readonly<{ status: "notGuesser" }>
  | Readonly<{ status: "emptyGuess" }>;

export interface SubmitJustOneGuessInput {
  readonly channelId: string;
  readonly playerId: string;
  readonly guess: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function submitJustOneGuess(input: SubmitJustOneGuessInput): SubmitJustOneGuessResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const result = submitGuess({
    engine: input.engine,
    session,
    playerId: input.playerId,
    guess: input.guess
  });

  if (result.status === "submitted") {
    input.registry.register({
      channelId: input.channelId,
      session: result.session
    });

    return result;
  }

  return result;
}
