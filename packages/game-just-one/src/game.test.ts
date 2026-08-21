import { describe, expect, it } from "vitest";

import {
  createGame,
  createJustOneEngine,
  confirmDuplicateReview,
  confirmResult,
  defaultWords,
  excludeHint,
  getDuplicateReviewHints,
  getHintSubmissionProgress,
  getNextGuesserId,
  getRemainingHints,
  getRevealResult,
  joinGame,
  justOneGame,
  justOneInitialState,
  reduceJustOneState,
  restoreHint,
  scoreRound,
  submitGuess,
  startDuplicateReview,
  startNextRound,
  submitHint,
  startGame
} from "./index.js";
import type { JustOneState } from "./state.js";

describe("Just One game", () => {
  it("provides the minimal initial state", () => {
    expect(justOneInitialState).toEqual({
      phase: "waiting",
      players: [],
      guesserId: null,
      secretWord: null,
      guess: null,
      result: null,
      score: 0,
      roundNumber: 0,
      hintsByPlayerId: {},
      excludedHintPlayerIds: []
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
      secretWord: null,
      guess: null,
      result: null,
      score: 0,
      roundNumber: 0,
      hintsByPlayerId: {},
      excludedHintPlayerIds: []
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
      secretWord: null,
      guess: null,
      result: null,
      score: 0,
      roundNumber: 0,
      hintsByPlayerId: {},
      excludedHintPlayerIds: []
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
      secretWord: "Apple",
      guess: null,
      result: null,
      score: 0,
      roundNumber: 1,
      hintsByPlayerId: {},
      excludedHintPlayerIds: []
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
      secretWord: "Coffee",
      guess: null,
      result: null,
      score: 0,
      roundNumber: 1,
      hintsByPlayerId: {},
      excludedHintPlayerIds: []
    });
  });

  it("stores a hint from a hint player", () => {
    const engine = createJustOneEngine();
    const session = startGame({
      engine,
      session: createGame({
        engine,
        id: "just-one-session-1",
        playerIds: ["player-1", "player-2"]
      }),
      random: createSequenceRandom([0, 0])
    });

    const result = submitHint({
      engine,
      session,
      playerId: "player-2",
      hint: "  red fruit  "
    });

    expect(result).toEqual({
      status: "submitted",
      session: expect.objectContaining({
        state: expect.objectContaining({
          hintsByPlayerId: {
            "player-2": "red fruit"
          }
        })
      })
    });
  });

  it("overwrites the hint when the same player submits again", () => {
    const engine = createJustOneEngine();
    const session = startGame({
      engine,
      session: createGame({
        engine,
        id: "just-one-session-1",
        playerIds: ["player-1", "player-2"]
      }),
      random: createSequenceRandom([0, 0])
    });
    const firstResult = submitHint({
      engine,
      session,
      playerId: "player-2",
      hint: "fruit"
    });

    if (firstResult.status !== "submitted") {
      throw new Error("Expected first hint submission to succeed");
    }

    const secondResult = submitHint({
      engine,
      session: firstResult.session,
      playerId: "player-2",
      hint: "red"
    });

    expect(secondResult).toEqual({
      status: "updated",
      session: expect.objectContaining({
        state: expect.objectContaining({
          hintsByPlayerId: {
            "player-2": "red"
          }
        })
      })
    });
  });

  it("rejects guesser hint submissions", () => {
    const engine = createJustOneEngine();
    const session = startGame({
      engine,
      session: createGame({
        engine,
        id: "just-one-session-1",
        playerIds: ["player-1", "player-2"]
      }),
      random: createSequenceRandom([0, 0])
    });

    expect(
      submitHint({
        engine,
        session,
        playerId: "player-1",
        hint: "fruit"
      })
    ).toEqual({ status: "guesserCannotSubmit" });
  });

  it("rejects hints from players who have not joined", () => {
    const engine = createJustOneEngine();
    const session = startGame({
      engine,
      session: createGame({
        engine,
        id: "just-one-session-1",
        playerIds: ["player-1", "player-2"]
      }),
      random: createSequenceRandom([0, 0])
    });

    expect(
      submitHint({
        engine,
        session,
        playerId: "player-3",
        hint: "fruit"
      })
    ).toEqual({ status: "notPlayer" });
  });

  it("rejects hints outside the hinting phase", () => {
    const engine = createJustOneEngine();
    const session = createGame({
      engine,
      id: "just-one-session-1",
      playerIds: ["player-1", "player-2"]
    });

    expect(
      submitHint({
        engine,
        session,
        playerId: "player-2",
        hint: "fruit"
      })
    ).toEqual({ status: "invalidPhase" });
  });

  it("rejects empty hints", () => {
    const engine = createJustOneEngine();
    const session = startGame({
      engine,
      session: createGame({
        engine,
        id: "just-one-session-1",
        playerIds: ["player-1", "player-2"]
      }),
      random: createSequenceRandom([0, 0])
    });

    expect(
      submitHint({
        engine,
        session,
        playerId: "player-2",
        hint: "   "
      })
    ).toEqual({ status: "emptyHint" });
  });

  it("derives hint submission progress without counting the guesser", () => {
    const engine = createJustOneEngine();
    const session = startGame({
      engine,
      session: createGame({
        engine,
        id: "just-one-session-1",
        playerIds: ["player-1", "player-2", "player-3"]
      }),
      random: createSequenceRandom([0, 0])
    });
    const firstResult = submitHint({
      engine,
      session,
      playerId: "player-2",
      hint: "fruit"
    });

    if (firstResult.status !== "submitted") {
      throw new Error("Expected hint submission to succeed");
    }

    expect(getHintSubmissionProgress(firstResult.session.state as JustOneState)).toEqual({
      submittedCount: 1,
      totalCount: 2,
      allSubmitted: false
    });
  });

  it("keeps the submission count stable when a hint is updated", () => {
    const engine = createJustOneEngine();
    const session = startGame({
      engine,
      session: createGame({
        engine,
        id: "just-one-session-1",
        playerIds: ["player-1", "player-2"]
      }),
      random: createSequenceRandom([0, 0])
    });
    const firstResult = submitHint({
      engine,
      session,
      playerId: "player-2",
      hint: "fruit"
    });

    if (firstResult.status !== "submitted") {
      throw new Error("Expected hint submission to succeed");
    }

    const updatedResult = submitHint({
      engine,
      session: firstResult.session,
      playerId: "player-2",
      hint: "red"
    });

    if (updatedResult.status !== "updated") {
      throw new Error("Expected hint update to succeed");
    }

    expect(getHintSubmissionProgress(updatedResult.session.state as JustOneState)).toEqual({
      submittedCount: 1,
      totalCount: 1,
      allSubmitted: true
    });
  });

  it("reports allSubmitted only when every hint player has submitted", () => {
    expect(
      getHintSubmissionProgress({
        phase: "hinting",
        players: ["player-1", "player-2", "player-3"],
        guesserId: "player-1",
        secretWord: "Apple",
        guess: null,
        result: null,
        score: 0,
        roundNumber: 1,
        hintsByPlayerId: {
          "player-2": "fruit",
          "player-3": "red"
        },
        excludedHintPlayerIds: []
      })
    ).toEqual({
      submittedCount: 2,
      totalCount: 2,
      allSubmitted: true
    });
  });

  it("does not report an empty game as all submitted", () => {
    expect(getHintSubmissionProgress(justOneInitialState)).toEqual({
      submittedCount: 0,
      totalCount: 0,
      allSubmitted: false
    });
  });

  it("starts duplicate review after every hint player has submitted", () => {
    const { engine, session } = createHintingSession();
    const firstHint = submitHint({ engine, session, playerId: "player-2", hint: "fruit" });

    if (firstHint.status !== "submitted") {
      throw new Error("Expected the first hint to be submitted");
    }

    const secondHint = submitHint({
      engine,
      session: firstHint.session,
      playerId: "player-3",
      hint: "red"
    });

    if (secondHint.status !== "submitted") {
      throw new Error("Expected the second hint to be submitted");
    }

    const result = startDuplicateReview({
      engine,
      session: secondHint.session
    });

    expect(result).toEqual({
      status: "started",
      session: expect.objectContaining({
        state: expect.objectContaining({ phase: "duplicateReview" })
      })
    });
  });

  it("does not start duplicate review while hints are incomplete", () => {
    const { engine, session } = createHintingSession();
    const hint = submitHint({ engine, session, playerId: "player-2", hint: "fruit" });

    if (hint.status !== "submitted") {
      throw new Error("Expected hint submission to succeed");
    }

    expect(startDuplicateReview({ engine, session: hint.session })).toEqual({
      status: "incompleteHints"
    });
  });

  it("does not start duplicate review outside the hinting phase", () => {
    const engine = createJustOneEngine();
    const session = createGame({
      engine,
      id: "just-one-session-1",
      playerIds: ["player-1", "player-2"]
    });

    expect(startDuplicateReview({ engine, session })).toEqual({ status: "invalidPhase" });
  });

  it("rejects duplicate review when the guesser has a hint", () => {
    const engine = createJustOneEngine();
    const session = engine.startSession({
      id: "just-one-session-1",
      players: [{ id: "player-1" }, { id: "player-2" }],
      initialState: {
        phase: "hinting",
        players: ["player-1", "player-2"],
        guesserId: "player-1",
        secretWord: "Apple",
        guess: null,
        hintsByPlayerId: {
          "player-1": "not allowed",
          "player-2": "fruit"
        },
        excludedHintPlayerIds: []
      }
    });

    expect(startDuplicateReview({ engine, session })).toEqual({ status: "guesserHasHint" });
  });

  it("closes hint submission and prevents duplicate review from starting twice", () => {
    const { engine, session } = createHintingSession();
    const firstHint = submitHint({ engine, session, playerId: "player-2", hint: "fruit" });

    if (firstHint.status !== "submitted") {
      throw new Error("Expected the first hint to be submitted");
    }

    const secondHint = submitHint({
      engine,
      session: firstHint.session,
      playerId: "player-3",
      hint: "red"
    });

    if (secondHint.status !== "submitted") {
      throw new Error("Expected the second hint to be submitted");
    }

    const started = startDuplicateReview({ engine, session: secondHint.session });

    if (started.status !== "started") {
      throw new Error("Expected duplicate review to start");
    }

    expect(
      submitHint({
        engine,
        session: started.session,
        playerId: "player-2",
        hint: "updated"
      })
    ).toEqual({ status: "invalidPhase" });
    expect(startDuplicateReview({ engine, session: started.session })).toEqual({
      status: "invalidPhase"
    });
  });

  it("excludes and restores an individual hint during duplicate review", () => {
    const { engine, session } = createDuplicateReviewSession();
    const excluded = excludeHint({ engine, session, playerId: "player-2" });

    expect(excluded).toEqual({
      status: "excluded",
      session: expect.objectContaining({
        state: expect.objectContaining({
          excludedHintPlayerIds: ["player-2"]
        })
      })
    });

    if (excluded.status !== "excluded") {
      throw new Error("Expected hint exclusion to succeed");
    }

    expect(restoreHint({ engine, session: excluded.session, playerId: "player-2" })).toEqual({
      status: "restored",
      session: expect.objectContaining({
        state: expect.objectContaining({
          excludedHintPlayerIds: []
        })
      })
    });
  });

  it("rejects invalid duplicate review hint changes", () => {
    const { engine, session } = createDuplicateReviewSession();

    expect(excludeHint({ engine, session, playerId: "player-1" })).toEqual({
      status: "guesserCannotReview"
    });
    expect(excludeHint({ engine, session, playerId: "player-4" })).toEqual({
      status: "notPlayer"
    });
    const excluded = excludeHint({ engine, session, playerId: "player-2" });

    if (excluded.status !== "excluded") {
      throw new Error("Expected hint exclusion to succeed");
    }

    expect(excludeHint({ engine, session: excluded.session, playerId: "player-2" })).toEqual({
      status: "alreadyExcluded"
    });
    expect(restoreHint({ engine, session, playerId: "player-3" })).toEqual({
      status: "notExcluded"
    });
  });

  it("rejects review hint changes outside duplicate review or without a submitted hint", () => {
    const { engine, session } = createHintingSession();

    expect(excludeHint({ engine, session, playerId: "player-2" })).toEqual({
      status: "invalidPhase"
    });

    const reviewSession = engine.startSession({
      id: "just-one-session-1",
      players: [{ id: "player-1" }, { id: "player-2" }, { id: "player-3" }],
      initialState: {
        phase: "duplicateReview",
        players: ["player-1", "player-2", "player-3"],
        guesserId: "player-1",
        secretWord: "Apple",
        guess: null,
        hintsByPlayerId: {
          "player-2": "fruit"
        },
        excludedHintPlayerIds: []
      }
    });

    expect(excludeHint({ engine, session: reviewSession, playerId: "player-3" })).toEqual({
      status: "hintNotFound"
    });
  });

  it("keeps duplicate review hints in player order and exposes exclusion state", () => {
    const { engine, session } = createDuplicateReviewSession();
    const excluded = excludeHint({ engine, session, playerId: "player-3" });

    if (excluded.status !== "excluded") {
      throw new Error("Expected hint exclusion to succeed");
    }

    expect(getDuplicateReviewHints(excluded.session.state as JustOneState)).toEqual([
      { playerId: "player-2", hint: "fruit", excluded: false },
      { playerId: "player-3", hint: "red", excluded: true }
    ]);
  });

  it("confirms duplicate review while preserving hints and exclusions", () => {
    const { engine, session } = createDuplicateReviewSession();
    const excluded = excludeHint({ engine, session, playerId: "player-2" });

    if (excluded.status !== "excluded") {
      throw new Error("Expected hint exclusion to succeed");
    }

    const confirmed = confirmDuplicateReview({ engine, session: excluded.session });

    expect(confirmed).toEqual({
      status: "confirmed",
      session: expect.objectContaining({
        state: expect.objectContaining({
          phase: "guessing",
          excludedHintPlayerIds: ["player-2"],
          hintsByPlayerId: {
            "player-2": "fruit",
            "player-3": "red"
          }
        })
      })
    });

    if (confirmed.status !== "confirmed") {
      throw new Error("Expected duplicate review confirmation to succeed");
    }

    expect(excludeHint({ engine, session: confirmed.session, playerId: "player-3" })).toEqual({
      status: "invalidPhase"
    });
    expect(restoreHint({ engine, session: confirmed.session, playerId: "player-2" })).toEqual({
      status: "invalidPhase"
    });
    expect(confirmDuplicateReview({ engine, session: confirmed.session })).toEqual({
      status: "invalidPhase"
    });
  });

  it("rejects confirmation with invalid exclusions and derives remaining hints in player order", () => {
    const { engine, session } = createDuplicateReviewSession();
    const invalidSession = engine.startSession({
      id: session.id,
      players: session.players,
      initialState: {
        ...(session.state as JustOneState),
        excludedHintPlayerIds: ["player-1"]
      }
    });

    expect(confirmDuplicateReview({ engine, session: invalidSession })).toEqual({
      status: "invalidState"
    });

    const excluded = excludeHint({ engine, session, playerId: "player-2" });

    if (excluded.status !== "excluded") {
      throw new Error("Expected hint exclusion to succeed");
    }

    expect(getRemainingHints(excluded.session.state as JustOneState)).toEqual([
      { playerId: "player-3", hint: "red" }
    ]);
  });

  it("stores a trimmed guess from the guesser without judging it", () => {
    const { engine, session } = createGuessingSession();
    const submitted = submitGuess({
      engine,
      session,
      playerId: "player-1",
      guess: "  Apple  "
    });

    expect(submitted).toEqual({
      status: "submitted",
      session: expect.objectContaining({
        state: expect.objectContaining({
          phase: "answered",
          guess: "Apple",
          secretWord: "Apple",
          hintsByPlayerId: {
            "player-2": "fruit",
            "player-3": "red"
          },
          excludedHintPlayerIds: ["player-2"]
        })
      })
    });
  });

  it("rejects guesses from non-guessers, empty input, and non-guessing phases", () => {
    const { engine, session } = createGuessingSession();

    expect(submitGuess({ engine, session, playerId: "player-2", guess: "Apple" })).toEqual({
      status: "notGuesser"
    });
    expect(submitGuess({ engine, session, playerId: "player-4", guess: "Apple" })).toEqual({
      status: "notPlayer"
    });
    expect(submitGuess({ engine, session, playerId: "player-1", guess: "   " })).toEqual({
      status: "emptyGuess"
    });

    const submitted = submitGuess({ engine, session, playerId: "player-1", guess: "Apple" });

    if (submitted.status !== "submitted") {
      throw new Error("Expected guess submission to succeed");
    }

    expect(
      submitGuess({ engine, session: submitted.session, playerId: "player-1", guess: "Apple" })
    ).toEqual({ status: "invalidPhase" });
    expect(
      submitGuess({
        engine,
        session: createHintingSession().session,
        playerId: "player-1",
        guess: "Apple"
      })
    ).toEqual({
      status: "invalidPhase"
    });
  });

  it("confirms a human-selected result without changing the revealed round data", () => {
    const { engine, session } = createGuessingSession();
    const submitted = submitGuess({ engine, session, playerId: "player-1", guess: "Orange" });

    if (submitted.status !== "submitted") {
      throw new Error("Expected guess submission to succeed");
    }

    const confirmed = confirmResult({
      engine,
      session: submitted.session,
      result: "correct"
    });

    expect(confirmed).toEqual({
      status: "confirmed",
      session: expect.objectContaining({
        state: expect.objectContaining({
          phase: "resultConfirmed",
          result: "correct",
          guess: "Orange",
          secretWord: "Apple",
          hintsByPlayerId: { "player-2": "fruit", "player-3": "red" },
          excludedHintPlayerIds: ["player-2"]
        })
      })
    });

    if (confirmed.status !== "confirmed") {
      throw new Error("Expected result confirmation to succeed");
    }

    expect(getRevealResult(confirmed.session.state as JustOneState)).toEqual({
      status: "ready",
      guesserId: "player-1",
      guess: "Orange",
      secretWord: "Apple"
    });
  });

  it("supports incorrect results and rejects invalid or repeated confirmation", () => {
    const { engine, session } = createGuessingSession();

    expect(confirmResult({ engine, session, result: "incorrect" })).toEqual({
      status: "invalidPhase"
    });

    const submitted = submitGuess({ engine, session, playerId: "player-1", guess: "Apple" });

    if (submitted.status !== "submitted") {
      throw new Error("Expected guess submission to succeed");
    }

    const withoutGuess = engine.startSession({
      id: submitted.session.id,
      players: submitted.session.players,
      initialState: { ...(submitted.session.state as JustOneState), guess: null }
    });
    expect(confirmResult({ engine, session: withoutGuess, result: "correct" })).toEqual({
      status: "invalidState"
    });

    const withoutSecretWord = engine.startSession({
      id: submitted.session.id,
      players: submitted.session.players,
      initialState: { ...(submitted.session.state as JustOneState), secretWord: null }
    });
    expect(confirmResult({ engine, session: withoutSecretWord, result: "correct" })).toEqual({
      status: "invalidState"
    });

    const confirmed = confirmResult({
      engine,
      session: submitted.session,
      result: "incorrect"
    });

    if (confirmed.status !== "confirmed") {
      throw new Error("Expected result confirmation to succeed");
    }

    expect(confirmResult({ engine, session: confirmed.session, result: "correct" })).toEqual({
      status: "invalidPhase"
    });
  });

  it("scores a correct result once and preserves round state", () => {
    const { engine, session } = createGuessingSession();
    const submitted = submitGuess({ engine, session, playerId: "player-1", guess: "Apple" });
    if (submitted.status !== "submitted") throw new Error("Expected guess submission to succeed");
    const confirmed = confirmResult({ engine, session: submitted.session, result: "correct" });
    if (confirmed.status !== "confirmed")
      throw new Error("Expected result confirmation to succeed");

    const existingScoreSession = engine.startSession({
      id: confirmed.session.id,
      players: confirmed.session.players,
      initialState: { ...(confirmed.session.state as JustOneState), score: 3 }
    });
    const scored = scoreRound({ engine, session: existingScoreSession });

    expect(scored).toEqual({
      status: "scored",
      points: 1,
      session: expect.objectContaining({
        state: expect.objectContaining({
          phase: "roundScored",
          score: 4,
          result: "correct",
          guess: "Apple",
          secretWord: "Apple",
          hintsByPlayerId: { "player-2": "fruit", "player-3": "red" },
          excludedHintPlayerIds: ["player-2"]
        })
      })
    });

    if (scored.status !== "scored") throw new Error("Expected round scoring to succeed");
    expect(getRevealResult(scored.session.state as JustOneState)).toEqual({
      status: "ready",
      guesserId: "player-1",
      guess: "Apple",
      secretWord: "Apple"
    });
  });

  it("keeps the score for an incorrect result and rejects repeated scoring", () => {
    const { engine, session } = createGuessingSession();
    const submitted = submitGuess({ engine, session, playerId: "player-1", guess: "Orange" });
    if (submitted.status !== "submitted") throw new Error("Expected guess submission to succeed");
    const confirmed = confirmResult({ engine, session: submitted.session, result: "incorrect" });
    if (confirmed.status !== "confirmed")
      throw new Error("Expected result confirmation to succeed");

    const scored = scoreRound({ engine, session: confirmed.session });
    if (scored.status !== "scored") throw new Error("Expected round scoring to succeed");

    expect(scored.points).toBe(0);
    expect((scored.session.state as JustOneState).score).toBe(0);
    expect(scoreRound({ engine, session: scored.session })).toEqual({ status: "invalidPhase" });
  });

  it("starts the next round with the next player and resets round state", () => {
    const { engine, session } = createScoredSession();
    const withExistingScore = engine.startSession({
      id: session.id,
      players: session.players,
      initialState: { ...(session.state as JustOneState), score: 3 }
    });

    const result = startNextRound({
      engine,
      session: withExistingScore,
      random: createSequenceRandom([0.5]),
      words: ["Apple", "Train", "Ocean"]
    });

    expect(result).toEqual({
      status: "started",
      session: expect.objectContaining({
        state: {
          phase: "hinting",
          players: ["player-1", "player-2", "player-3"],
          guesserId: "player-2",
          secretWord: "Train",
          guess: null,
          result: null,
          score: 3,
          roundNumber: 2,
          hintsByPlayerId: {},
          excludedHintPlayerIds: []
        }
      })
    });

    if (result.status !== "started") throw new Error("Expected next round to start");
    const scoredAgain = engine.startSession({
      id: result.session.id,
      players: result.session.players,
      initialState: {
        ...(result.session.state as JustOneState),
        phase: "roundScored"
      }
    });
    const thirdRound = startNextRound({
      engine,
      session: scoredAgain,
      random: createSequenceRandom([0]),
      words: ["Ocean"]
    });

    expect(thirdRound).toEqual({
      status: "started",
      session: expect.objectContaining({
        state: expect.objectContaining({ roundNumber: 3, score: 3 })
      })
    });
  });

  it("rotates from the last player back to the first player", () => {
    expect(
      getNextGuesserId({
        phase: "roundScored",
        players: ["player-1", "player-2", "player-3"],
        guesserId: "player-3",
        secretWord: "Apple",
        guess: "Apple",
        result: "correct",
        score: 1,
        roundNumber: 1,
        hintsByPlayerId: {},
        excludedHintPlayerIds: []
      })
    ).toBe("player-1");
  });

  it("rejects next rounds from an invalid phase or state", () => {
    const { engine, session } = createGuessingSession();

    expect(startNextRound({ engine, session, random: () => 0 })).toEqual({
      status: "invalidPhase"
    });

    const { session: scoredSession } = createScoredSession();
    const invalidGuesserSession = engine.startSession({
      id: scoredSession.id,
      players: scoredSession.players,
      initialState: { ...(scoredSession.state as JustOneState), guesserId: "missing-player" }
    });

    expect(startNextRound({ engine, session: invalidGuesserSession, random: () => 0 })).toEqual({
      status: "invalidState"
    });
    expect(startNextRound({ engine, session: scoredSession, random: () => 0, words: [] })).toEqual({
      status: "noWords"
    });
    expect(
      startNextRound({ engine, session: scoredSession, random: () => 1, words: ["Apple"] })
    ).toEqual({ status: "invalidState" });
  });
});

function createScoredSession() {
  const { engine, session } = createGuessingSession();
  const submitted = submitGuess({ engine, session, playerId: "player-1", guess: "Apple" });
  if (submitted.status !== "submitted") throw new Error("Expected guess submission to succeed");
  const confirmed = confirmResult({ engine, session: submitted.session, result: "correct" });
  if (confirmed.status !== "confirmed") throw new Error("Expected result confirmation to succeed");
  const scored = scoreRound({ engine, session: confirmed.session });
  if (scored.status !== "scored") throw new Error("Expected round scoring to succeed");

  return { engine, session: scored.session };
}

function createDuplicateReviewSession() {
  const { engine, session } = createHintingSession();
  const firstHint = submitHint({ engine, session, playerId: "player-2", hint: "fruit" });

  if (firstHint.status !== "submitted") {
    throw new Error("Expected the first hint to be submitted");
  }

  const secondHint = submitHint({
    engine,
    session: firstHint.session,
    playerId: "player-3",
    hint: "red"
  });

  if (secondHint.status !== "submitted") {
    throw new Error("Expected the second hint to be submitted");
  }

  const started = startDuplicateReview({ engine, session: secondHint.session });

  if (started.status !== "started") {
    throw new Error("Expected duplicate review to start");
  }

  return { engine, session: started.session };
}

function createGuessingSession() {
  const { engine, session } = createDuplicateReviewSession();
  const excluded = excludeHint({ engine, session, playerId: "player-2" });

  if (excluded.status !== "excluded") {
    throw new Error("Expected hint exclusion to succeed");
  }

  const confirmed = confirmDuplicateReview({ engine, session: excluded.session });

  if (confirmed.status !== "confirmed") {
    throw new Error("Expected duplicate review confirmation to succeed");
  }

  return { engine, session: confirmed.session };
}

function createHintingSession() {
  const engine = createJustOneEngine();
  const session = startGame({
    engine,
    session: createGame({
      engine,
      id: "just-one-session-1",
      playerIds: ["player-1", "player-2", "player-3"]
    }),
    random: createSequenceRandom([0, 0])
  });

  return { engine, session };
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
