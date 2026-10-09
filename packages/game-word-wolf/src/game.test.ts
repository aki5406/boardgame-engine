import { describe, expect, it } from "vitest";

import {
  createGame,
  createWordWolfEngine,
  defaultWordPairs,
  getAssignedWord,
  joinGame,
  reduceWordWolfState,
  startGame,
  startVoting,
  wordWolfGame,
  wordWolfInitialState,
  type WordWolfState,
  type WordWolfWordPair
} from "./index.js";

describe("Word Wolf game", () => {
  it("provides an empty waiting state", () => {
    expect(wordWolfInitialState).toEqual({
      phase: "waiting",
      players: [],
      minorityPlayerId: null,
      majorityWord: null,
      minorityWord: null
    });
  });

  it("creates a game session with waiting state", () => {
    const engine = createWordWolfEngine();
    const session = createGame({ engine, id: "word-wolf-session-1" });

    expect(wordWolfGame.id).toBe("word-wolf");
    expect(session.players).toEqual([]);
    expect(session.state).toEqual(wordWolfInitialState);
  });

  it("provides multiple unordered default word pairs", () => {
    expect(defaultWordPairs.length).toBeGreaterThan(1);
    expect(
      defaultWordPairs.every(({ words: [firstWord, secondWord] }) => firstWord !== secondWord)
    ).toBe(true);
  });

  it("adds players in join order and rejects duplicate joins", () => {
    const engine = createWordWolfEngine();
    const session = createSessionWithPlayers(engine, ["player-1", "player-2"]);

    expect(session.players).toEqual([{ id: "player-1" }, { id: "player-2" }]);
    expect(session.state).toMatchObject({ players: ["player-1", "player-2"] });
    expect(joinGame({ engine, session, playerId: "player-1" })).toEqual({
      status: "alreadyJoined"
    });
  });

  it("requires at least three players to start without changing the session", () => {
    const engine = createWordWolfEngine();
    const session = createSessionWithPlayers(engine, ["player-1", "player-2"]);

    expect(startGame({ engine, session, random: createSequenceRandom([]) })).toEqual({
      status: "notEnoughPlayers"
    });
    expect(session.state).toMatchObject({
      phase: "waiting",
      minorityPlayerId: null,
      majorityWord: null,
      minorityWord: null
    });
  });

  it("selects a minority player, pair, and group words with injected random", () => {
    const engine = createWordWolfEngine();
    const session = createSessionWithPlayers(engine, ["player-1", "player-2", "player-3"]);
    const wordPairs: readonly WordWolfWordPair[] = [
      { words: ["Sun", "Moon"] },
      { words: ["Summer", "Winter"] }
    ];

    const result = startGame({
      engine,
      session,
      random: createSequenceRandom([0.5, 0.5, 0.75]),
      wordPairs
    });

    expect(result.status).toBe("started");
    if (result.status !== "started") {
      return;
    }

    expect(result.session.state).toEqual({
      phase: "discussion",
      players: ["player-1", "player-2", "player-3"],
      minorityPlayerId: "player-2",
      majorityWord: "Winter",
      minorityWord: "Summer"
    });
    expect(result.session.players).toEqual([
      { id: "player-1" },
      { id: "player-2" },
      { id: "player-3" }
    ]);
    expect(wordPairs).toEqual([{ words: ["Sun", "Moon"] }, { words: ["Summer", "Winter"] }]);
  });

  it("can reverse the group word assignment for the same pair", () => {
    const engine = createWordWolfEngine();
    const session = createSessionWithPlayers(engine, ["player-1", "player-2", "player-3"]);
    const wordPairs: readonly WordWolfWordPair[] = [{ words: ["Sun", "Moon"] }];

    const result = startGame({
      engine,
      session,
      random: createSequenceRandom([0, 0, 0]),
      wordPairs
    });

    expect(result).toMatchObject({
      status: "started",
      session: {
        state: {
          majorityWord: "Sun",
          minorityWord: "Moon"
        }
      }
    });
  });

  it("supports a four-player game and random values near one", () => {
    const engine = createWordWolfEngine();
    const session = createSessionWithPlayers(engine, [
      "player-1",
      "player-2",
      "player-3",
      "player-4"
    ]);

    const result = startGame({
      engine,
      session,
      random: createSequenceRandom([0.999, 0.999, 0.999])
    });

    expect(result).toMatchObject({
      status: "started",
      session: {
        state: {
          minorityPlayerId: "player-4"
        }
      }
    });
  });

  it("rejects an empty word pair list without changing the session", () => {
    const engine = createWordWolfEngine();
    const session = createSessionWithPlayers(engine, ["player-1", "player-2", "player-3"]);

    expect(startGame({ engine, session, random: createSequenceRandom([]), wordPairs: [] })).toEqual(
      { status: "noWordPairs" }
    );
    expect(session.state).toMatchObject({
      phase: "waiting",
      minorityPlayerId: null,
      majorityWord: null,
      minorityWord: null
    });
  });

  it("rejects joins and starts after discussion begins", () => {
    const engine = createWordWolfEngine();
    const session = createSessionWithPlayers(engine, ["player-1", "player-2", "player-3"]);
    const started = getStartedSession(
      startGame({ engine, session, random: createSequenceRandom([0, 0, 0]) })
    );

    expect(joinGame({ engine, session: started, playerId: "player-4" })).toEqual({
      status: "invalidPhase"
    });
    expect(startGame({ engine, session: started, random: createSequenceRandom([]) })).toEqual({
      status: "invalidPhase"
    });
  });

  it("returns assigned words only for participants after start", () => {
    const engine = createWordWolfEngine();
    const waitingSession = createSessionWithPlayers(engine, ["player-1", "player-2", "player-3"]);
    const started = getStartedSession(
      startGame({
        engine,
        session: waitingSession,
        random: createSequenceRandom([0, 0, 0]),
        wordPairs: [{ words: ["Sun", "Moon"] }]
      })
    );

    expect(getAssignedWord(waitingSession.state as WordWolfState, "player-1")).toBeUndefined();
    expect(getAssignedWord(started.state as WordWolfState, "player-1")).toBe("Moon");
    expect(getAssignedWord(started.state as WordWolfState, "player-2")).toBe("Sun");
    expect(getAssignedWord(started.state as WordWolfState, "unknown-player")).toBeUndefined();
  });

  it("allows any participant to start voting and preserves secret state", () => {
    const engine = createWordWolfEngine();
    const discussionSession = createDiscussionSession(engine);

    const result = startVoting({
      engine,
      session: discussionSession,
      playerId: "player-2"
    });

    expect(result.status).toBe("started");
    if (result.status !== "started") {
      return;
    }

    expect(result.session.state).toEqual({
      phase: "voting",
      players: ["player-1", "player-2", "player-3"],
      minorityPlayerId: "player-1",
      majorityWord: "Sun",
      minorityWord: "Moon"
    });
  });

  it("rejects voting started by a non-participant", () => {
    const engine = createWordWolfEngine();
    const discussionSession = createDiscussionSession(engine);

    expect(
      startVoting({
        engine,
        session: discussionSession,
        playerId: "not-a-player"
      })
    ).toEqual({ status: "notParticipant" });
  });

  it("rejects voting outside the discussion phase", () => {
    const engine = createWordWolfEngine();
    const waitingSession = createSessionWithPlayers(engine, ["player-1", "player-2", "player-3"]);
    const discussionSession = createDiscussionSession(engine);
    const votingSession = getStartedVotingSession(
      startVoting({ engine, session: discussionSession, playerId: "player-1" })
    );

    expect(startVoting({ engine, session: waitingSession, playerId: "player-1" })).toEqual({
      status: "invalidPhase"
    });
    expect(startVoting({ engine, session: votingSession, playerId: "player-1" })).toEqual({
      status: "invalidPhase"
    });
  });

  it("reduces creation, join, and start events", () => {
    const joined = reduceWordWolfState(wordWolfInitialState, {
      type: "word-wolf.playerJoined",
      playerId: "player-1"
    });
    const started = reduceWordWolfState(joined, {
      type: "word-wolf.gameStarted",
      minorityPlayerId: "player-1",
      majorityWord: "Dog",
      minorityWord: "Cat"
    });
    const voting = reduceWordWolfState(started, { type: "word-wolf.votingStarted" });

    expect(reduceWordWolfState(started, { type: "word-wolf.gameCreated" })).toEqual(
      wordWolfInitialState
    );
    expect(voting).toEqual({
      phase: "voting",
      players: ["player-1"],
      minorityPlayerId: "player-1",
      majorityWord: "Dog",
      minorityWord: "Cat"
    });
  });
});

function createSessionWithPlayers(
  engine: ReturnType<typeof createWordWolfEngine>,
  playerIds: readonly string[]
) {
  return playerIds.reduce(
    (session, playerId) => {
      return getJoinedSession(joinGame({ engine, session, playerId }));
    },
    createGame({ engine, id: "word-wolf-session-1" })
  );
}

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

function getStartedVotingSession(result: ReturnType<typeof startVoting>) {
  if (result.status !== "started") {
    throw new Error(`Expected a started voting session, received ${result.status}.`);
  }

  return result.session;
}

function createDiscussionSession(engine: ReturnType<typeof createWordWolfEngine>) {
  const waitingSession = createSessionWithPlayers(engine, ["player-1", "player-2", "player-3"]);

  return getStartedSession(
    startGame({
      engine,
      session: waitingSession,
      random: createSequenceRandom([0, 0, 0]),
      wordPairs: [{ words: ["Sun", "Moon"] }]
    })
  );
}

function createSequenceRandom(values: readonly number[]) {
  let index = 0;

  return () => values[index++] ?? 0;
}
