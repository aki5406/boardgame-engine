import { describe, expect, it } from "vitest";

import {
  confirmDuplicateReview,
  createGame,
  createJustOneEngine,
  startDuplicateReview,
  startGame,
  submitGuess,
  submitHint
} from "@boardgame/game-just-one";

import { confirmJustOneResult } from "./result.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { getJustOneState } from "./state.js";

describe("confirmJustOneResult", () => {
  it("stores the confirmed result in the registered session", () => {
    const { engine, registry } = setupAnsweredSession();

    expect(
      confirmJustOneResult({
        channelId: "channel-1",
        result: "incorrect",
        engine,
        registry
      })
    ).toMatchObject({ status: "confirmed" });
    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({
      phase: "resultConfirmed",
      result: "incorrect",
      guess: "Apple",
      secretWord: "Apple"
    });
  });

  it("rejects a missing game and a repeated result", () => {
    const { engine, registry } = setupAnsweredSession();

    expect(
      confirmJustOneResult({
        channelId: "missing-channel",
        result: "correct",
        engine,
        registry
      })
    ).toEqual({ status: "notFound" });
    expect(
      confirmJustOneResult({ channelId: "channel-1", result: "correct", engine, registry })
    ).toMatchObject({ status: "confirmed" });
    expect(
      confirmJustOneResult({ channelId: "channel-1", result: "incorrect", engine, registry })
    ).toEqual({ status: "invalidPhase" });
  });
});

function setupAnsweredSession() {
  const engine = createJustOneEngine();
  const registry = createJustOneDiscordSessionRegistry();
  const started = startGame({
    engine,
    session: createGame({ engine, id: "just-one:channel-1", playerIds: ["player-1", "player-2"] }),
    random: createSequenceRandom([0, 0]),
    words: ["Apple"]
  });
  const hint = submitHint({ engine, session: started, playerId: "player-2", hint: "Fruit" });

  if (hint.status !== "submitted") throw new Error("Expected hint submission to succeed");

  const review = startDuplicateReview({ engine, session: hint.session });
  if (review.status !== "started") throw new Error("Expected duplicate review to start");

  const guessing = confirmDuplicateReview({ engine, session: review.session });
  if (guessing.status !== "confirmed") throw new Error("Expected review confirmation to succeed");

  const answered = submitGuess({
    engine,
    session: guessing.session,
    playerId: "player-1",
    guess: "Apple"
  });
  if (answered.status !== "submitted") throw new Error("Expected guess submission to succeed");

  registry.register({ channelId: "channel-1", session: answered.session });
  return { engine, registry };
}

function createSequenceRandom(values: readonly number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}
