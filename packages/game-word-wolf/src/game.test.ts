import { describe, expect, it } from "vitest";

import {
  createGame,
  createWordWolfEngine,
  joinGame,
  reduceWordWolfState,
  startGame,
  wordWolfGame,
  wordWolfInitialState
} from "./index.js";

describe("Word Wolf game", () => {
  it("provides an empty waiting state", () => {
    expect(wordWolfInitialState).toEqual({
      phase: "waiting",
      players: []
    });
  });

  it("creates a game session with waiting state", () => {
    const engine = createWordWolfEngine();
    const session = createGame({ engine, id: "word-wolf-session-1" });

    expect(wordWolfGame.id).toBe("word-wolf");
    expect(session.players).toEqual([]);
    expect(session.state).toEqual(wordWolfInitialState);
  });

  it("adds players in join order", () => {
    const engine = createWordWolfEngine();
    const session = createGame({ engine, id: "word-wolf-session-1" });
    const firstJoin = joinGame({ engine, session, playerId: "player-1" });

    expect(firstJoin.status).toBe("joined");
    if (firstJoin.status !== "joined") {
      return;
    }

    const secondJoin = joinGame({ engine, session: firstJoin.session, playerId: "player-2" });

    expect(secondJoin).toMatchObject({ status: "joined" });
    if (secondJoin.status !== "joined") {
      return;
    }

    expect(secondJoin.session.players).toEqual([{ id: "player-1" }, { id: "player-2" }]);
    expect(secondJoin.session.state).toEqual({
      phase: "waiting",
      players: ["player-1", "player-2"]
    });
  });

  it("rejects duplicate joins", () => {
    const engine = createWordWolfEngine();
    const session = createGame({ engine, id: "word-wolf-session-1" });
    const joined = joinGame({ engine, session, playerId: "player-1" });

    expect(joined.status).toBe("joined");
    if (joined.status !== "joined") {
      return;
    }

    expect(joinGame({ engine, session: joined.session, playerId: "player-1" })).toEqual({
      status: "alreadyJoined"
    });
  });

  it("starts with three or more players and preserves the roster", () => {
    const engine = createWordWolfEngine();
    const created = createGame({ engine, id: "word-wolf-session-1" });
    const first = joinGame({ engine, session: created, playerId: "player-1" });
    const second = joinGame({ engine, session: getJoinedSession(first), playerId: "player-2" });
    const third = joinGame({ engine, session: getJoinedSession(second), playerId: "player-3" });
    const started = startGame({ engine, session: getJoinedSession(third) });

    expect(started.status).toBe("started");
    if (started.status !== "started") {
      return;
    }

    expect(started.session.state).toEqual({
      phase: "discussion",
      players: ["player-1", "player-2", "player-3"]
    });
    expect(started.session.players).toEqual([
      { id: "player-1" },
      { id: "player-2" },
      { id: "player-3" }
    ]);
  });

  it("requires at least three players to start", () => {
    const engine = createWordWolfEngine();
    const created = createGame({ engine, id: "word-wolf-session-1" });

    expect(startGame({ engine, session: created })).toEqual({ status: "notEnoughPlayers" });
  });

  it("starts with four players", () => {
    const engine = createWordWolfEngine();
    const created = createGame({ engine, id: "word-wolf-session-1" });
    const first = joinGame({ engine, session: created, playerId: "player-1" });
    const second = joinGame({ engine, session: getJoinedSession(first), playerId: "player-2" });
    const third = joinGame({ engine, session: getJoinedSession(second), playerId: "player-3" });
    const fourth = joinGame({ engine, session: getJoinedSession(third), playerId: "player-4" });

    expect(startGame({ engine, session: getJoinedSession(fourth) })).toMatchObject({
      status: "started"
    });
  });

  it("rejects joins and starts after discussion begins", () => {
    const engine = createWordWolfEngine();
    const created = createGame({ engine, id: "word-wolf-session-1" });
    const first = joinGame({ engine, session: created, playerId: "player-1" });
    const second = joinGame({ engine, session: getJoinedSession(first), playerId: "player-2" });
    const third = joinGame({ engine, session: getJoinedSession(second), playerId: "player-3" });
    const started = startGame({ engine, session: getJoinedSession(third) });
    const discussionSession = getStartedSession(started);

    expect(joinGame({ engine, session: discussionSession, playerId: "player-4" })).toEqual({
      status: "invalidPhase"
    });
    expect(startGame({ engine, session: discussionSession })).toEqual({ status: "invalidPhase" });
  });

  it("reduces creation, join, and start events", () => {
    const joined = reduceWordWolfState(wordWolfInitialState, {
      type: "word-wolf.playerJoined",
      playerId: "player-1"
    });
    const started = reduceWordWolfState(joined, { type: "word-wolf.gameStarted" });

    expect(reduceWordWolfState(started, { type: "word-wolf.gameCreated" })).toEqual(
      wordWolfInitialState
    );
    expect(started).toEqual({
      phase: "discussion",
      players: ["player-1"]
    });
  });
});

function getJoinedSession(result: ReturnType<typeof joinGame>) {
  if (result.status !== "joined") {
    throw new Error(`Expected a joined session, received ${result.status}.`);
  }

  return result.session;
}

function getStartedSession(result: ReturnType<typeof startGame>) {
  if (result.status !== "started") {
    throw new Error(`Expected a started session, received ${result.status}.`);
  }

  return result.session;
}
