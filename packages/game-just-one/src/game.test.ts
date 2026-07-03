import { describe, expect, it } from "vitest";

import {
  createGame,
  createJustOneEngine,
  defaultWords,
  joinGame,
  justOneGame,
  justOneInitialState,
  reduceJustOneState,
  startGame
} from "./index.js";

describe("Just One game", () => {
  it("provides the minimal initial state", () => {
    expect(justOneInitialState).toEqual({
      phase: "waiting",
      players: [],
      guesserId: null,
      secretWord: null
    });
  });

  it("stores joined players in state through the reducer", () => {
    const nextState = reduceJustOneState(justOneInitialState, {
      type: "just-one.playerJoined",
      playerId: "player-1"
    });

    expect(nextState).toEqual({
      phase: "waiting",
      players: ["player-1"],
      guesserId: null,
      secretWord: null
    });
  });

  it("creates a game session with waiting state", () => {
    const engine = createJustOneEngine();
    const session = createGame({
      engine,
      id: "just-one-session-1"
    });

    expect(justOneGame.id).toBe("just-one");
    expect(session.players).toEqual([]);
    expect(session.state).toEqual(justOneInitialState);
  });

  it("joins a player into the game session", () => {
    const engine = createJustOneEngine();
    const session = createGame({
      engine,
      id: "just-one-session-1"
    });

    const nextSession = joinGame({
      engine,
      session,
      playerId: "player-1"
    });

    expect(nextSession.players).toEqual([{ id: "player-1" }]);
    expect(nextSession.state).toEqual({
      phase: "waiting",
      players: ["player-1"],
      guesserId: null,
      secretWord: null
    });
  });

  it("does not duplicate an existing player on join", () => {
    const engine = createJustOneEngine();
    const session = createGame({
      engine,
      id: "just-one-session-1",
      playerIds: ["player-1"]
    });

    const nextSession = joinGame({
      engine,
      session,
      playerId: "player-1"
    });

    expect(nextSession).toBe(session);
  });

  it("starts the game by switching the phase to hinting and choosing a guesser", () => {
    const engine = createJustOneEngine();
    const session = createGame({
      engine,
      id: "just-one-session-1",
      playerIds: ["player-1", "player-2"]
    });

    const nextSession = startGame({
      engine,
      session,
      random: createSequenceRandom([0, 0])
    });

    expect(nextSession.state).toEqual({
      phase: "hinting",
      players: ["player-1", "player-2"],
      guesserId: "player-1",
      secretWord: "Apple"
    });
  });

  it("always chooses a guesser from joined players", () => {
    const engine = createJustOneEngine();
    const session = createGame({
      engine,
      id: "just-one-session-1",
      playerIds: ["player-1", "player-2", "player-3"]
    });

    const nextSession = startGame({
      engine,
      session,
      random: createSequenceRandom([0.6, 0.2])
    });

    expect(nextSession.state.phase).toBe("hinting");
    expect(nextSession.state.guesserId).toBeDefined();
    expect(nextSession.state.guesserId).not.toBeNull();
    expect(["player-1", "player-2", "player-3"]).toContain(nextSession.state.guesserId);
    expect(nextSession.state.secretWord).not.toBeNull();
    expect(defaultWords).toContain(nextSession.state.secretWord as (typeof defaultWords)[number]);
  });

  it("supports deterministic guesser and secret word selection with injected random", () => {
    const engine = createJustOneEngine();
    const session = createGame({
      engine,
      id: "just-one-session-1",
      playerIds: ["player-1", "player-2", "player-3"]
    });

    const nextSession = startGame({
      engine,
      session,
      random: createSequenceRandom([0.99, 0.8])
    });

    expect(nextSession.state).toEqual({
      phase: "hinting",
      players: ["player-1", "player-2", "player-3"],
      guesserId: "player-3",
      secretWord: "Coffee"
    });
  });
});

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
