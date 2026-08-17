import { describe, expect, it } from "vitest";

import {
  confirmDuplicateReview,
  createGame,
  createJustOneEngine,
  startDuplicateReview,
  startGame,
  submitHint
} from "@boardgame/game-just-one";

import { submitJustOneGuess } from "./guess.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { getJustOneState } from "./state.js";

describe("submitJustOneGuess", () => {
  it("stores a trimmed guess and updates the registered session", () => {
    const { engine, registry } = setupGuessingSession();

    expect(
      submitJustOneGuess({
        channelId: "channel-1",
        playerId: "player-1",
        guess: "  Apple  ",
        engine,
        registry
      })
    ).toMatchObject({ status: "submitted" });

    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({
      phase: "answered",
      guess: "Apple",
      secretWord: "Apple"
    });
  });

  it("rejects non-guessers, missing games, and a repeated submission", () => {
    const { engine, registry } = setupGuessingSession();

    expect(
      submitJustOneGuess({
        channelId: "channel-1",
        playerId: "player-2",
        guess: "Apple",
        engine,
        registry
      })
    ).toEqual({ status: "notGuesser" });
    expect(
      submitJustOneGuess({
        channelId: "missing-channel",
        playerId: "player-1",
        guess: "Apple",
        engine,
        registry
      })
    ).toEqual({ status: "notFound" });
    expect(
      submitJustOneGuess({
        channelId: "channel-1",
        playerId: "player-1",
        guess: "Apple",
        engine,
        registry
      })
    ).toMatchObject({ status: "submitted" });
    expect(
      submitJustOneGuess({
        channelId: "channel-1",
        playerId: "player-1",
        guess: "Apple",
        engine,
        registry
      })
    ).toEqual({ status: "invalidPhase" });
  });
});

function setupGuessingSession() {
  const engine = createJustOneEngine();
  const registry = createJustOneDiscordSessionRegistry();
  const hintingSession = startGame({
    engine,
    session: createGame({
      engine,
      id: "just-one:channel-1",
      playerIds: ["player-1", "player-2"]
    }),
    random: createSequenceRandom([0, 0]),
    words: ["Apple"]
  });
  const hint = submitHint({
    engine,
    session: hintingSession,
    playerId: "player-2",
    hint: "Fruit"
  });

  if (hint.status !== "submitted") {
    throw new Error("Expected hint submission to succeed");
  }

  const review = startDuplicateReview({ engine, session: hint.session });

  if (review.status !== "started") {
    throw new Error("Expected duplicate review to start");
  }

  const confirmed = confirmDuplicateReview({ engine, session: review.session });

  if (confirmed.status !== "confirmed") {
    throw new Error("Expected duplicate review confirmation to succeed");
  }

  registry.register({ channelId: "channel-1", session: confirmed.session });

  return { engine, registry };
}

function createSequenceRandom(values: readonly number[]): () => number {
  let index = 0;

  return () => {
    const value = values[index];

    if (value === undefined) {
      throw new Error("Missing random value for test");
    }

    index += 1;
    return value;
  };
}
