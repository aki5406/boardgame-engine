import { describe, expect, it } from "vitest";

import {
  createGame,
  createJustOneEngine,
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

  it("starts the game by switching the phase to hinting", () => {
    const engine = createJustOneEngine();
    const session = createGame({
      engine,
      id: "just-one-session-1",
      playerIds: ["player-1", "player-2"]
    });

    const nextSession = startGame({
      engine,
      session
    });

    expect(nextSession.state).toEqual({
      phase: "hinting",
      players: ["player-1", "player-2"],
      guesserId: null,
      secretWord: null
    });
  });
});
