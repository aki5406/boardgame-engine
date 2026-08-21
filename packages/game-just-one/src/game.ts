import {
  createEngine,
  type Engine,
  type EngineGame,
  type EngineGameSession,
  type EnginePlayer
} from "@boardgame/engine";

import type { JustOneEvent } from "./event.js";
import { justOneReducer } from "./reducer.js";
import type { PlayerId, JustOneState } from "./state.js";
import { defaultWords } from "./words.js";

export type JustOneRandom = () => number;

export const justOneInitialState: JustOneState = {
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
};

export const justOneGame: EngineGame = {
  id: "just-one",
  reducer: justOneReducer
};

export interface CreateGameInput {
  readonly engine: Engine;
  readonly id: string;
  readonly playerIds?: readonly PlayerId[];
}

export interface JoinGameInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly playerId: PlayerId;
}

export interface StartGameInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly random?: JustOneRandom;
  readonly words?: readonly string[];
}

export type SubmitHintResult =
  | Readonly<{ status: "submitted"; session: EngineGameSession }>
  | Readonly<{ status: "updated"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "notPlayer" }>
  | Readonly<{ status: "guesserCannotSubmit" }>
  | Readonly<{ status: "emptyHint" }>;

export interface SubmitHintInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly playerId: PlayerId;
  readonly hint: string;
}

export interface HintSubmissionProgress {
  readonly submittedCount: number;
  readonly totalCount: number;
  readonly allSubmitted: boolean;
}

export type StartDuplicateReviewResult =
  | Readonly<{ status: "started"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "incompleteHints" }>
  | Readonly<{ status: "guesserHasHint" }>;

export interface StartDuplicateReviewInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
}

export type ReviewHintResult =
  | Readonly<{ status: "excluded" | "restored"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "notPlayer" }>
  | Readonly<{ status: "guesserCannotReview" }>
  | Readonly<{ status: "hintNotFound" }>
  | Readonly<{ status: "alreadyExcluded" }>
  | Readonly<{ status: "notExcluded" }>;

export interface ReviewHintInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly playerId: PlayerId;
}

export interface JustOneDuplicateReviewHint {
  readonly playerId: PlayerId;
  readonly hint: string;
  readonly excluded: boolean;
}

export interface JustOneRemainingHint {
  readonly playerId: PlayerId;
  readonly hint: string;
}

export type ConfirmDuplicateReviewResult =
  | Readonly<{ status: "confirmed"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "invalidState" }>;

export interface ConfirmDuplicateReviewInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
}

export type SubmitGuessResult =
  | Readonly<{ status: "submitted"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "notPlayer" }>
  | Readonly<{ status: "notGuesser" }>
  | Readonly<{ status: "emptyGuess" }>;

export interface SubmitGuessInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly playerId: PlayerId;
  readonly guess: string;
}

export type JustOneResult = "correct" | "incorrect";

export type ConfirmResultResult =
  | Readonly<{ status: "confirmed"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "invalidState" }>;

export interface ConfirmResultInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly result: JustOneResult;
}

export type GetRevealResult =
  | Readonly<{
      status: "ready";
      guesserId: PlayerId;
      guess: string;
      secretWord: string;
    }>
  | Readonly<{ status: "invalidState" }>;

export type ScoreRoundResult =
  | Readonly<{ status: "scored"; points: number; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "invalidState" }>;

export interface ScoreRoundInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
}

export type StartNextRoundResult =
  | Readonly<{ status: "started"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "invalidState" }>
  | Readonly<{ status: "noWords" }>;

export interface StartNextRoundInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly random: JustOneRandom;
  readonly words?: readonly string[];
}

export function createJustOneEngine(): Engine {
  return createEngine(justOneGame);
}

export function createGame(input: CreateGameInput): EngineGameSession {
  const players = toEnginePlayers(input.playerIds ?? []);

  return input.engine.startSession({
    id: input.id,
    players,
    initialState: {
      ...justOneInitialState,
      players: players.map((player) => player.id)
    }
  });
}

export function joinGame(input: JoinGameInput): EngineGameSession {
  if (input.session.players.some((player) => player.id === input.playerId)) {
    return input.session;
  }

  const event: JustOneEvent = {
    type: "just-one.playerJoined",
    playerId: input.playerId
  };
  const nextState = input.engine.applyEvent({
    session: input.session,
    event
  }).state;

  return input.engine.startSession({
    id: input.session.id,
    players: [...input.session.players, { id: input.playerId }],
    initialState: nextState
  });
}

export function startGame(input: StartGameInput): EngineGameSession {
  const random = input.random ?? Math.random;
  const guesserId = chooseRandomGuesserId(input.session.players, random);
  const secretWord = chooseRandomWord(input.words ?? defaultWords, random);
  const event: JustOneEvent = {
    type: "just-one.gameStarted",
    guesserId,
    secretWord
  };

  return input.engine.applyEvent({
    session: input.session,
    event
  });
}

export function submitHint(input: SubmitHintInput): SubmitHintResult {
  const state = input.session.state as JustOneState;
  const normalizedHint = input.hint.trim();

  if (state.phase !== "hinting") {
    return { status: "invalidPhase" };
  }

  if (!input.session.players.some((player) => player.id === input.playerId)) {
    return { status: "notPlayer" };
  }

  if (state.guesserId === input.playerId) {
    return { status: "guesserCannotSubmit" };
  }

  if (normalizedHint.length === 0) {
    return { status: "emptyHint" };
  }

  const hadHint = state.hintsByPlayerId[input.playerId] !== undefined;
  const event: JustOneEvent = {
    type: "just-one.hintSubmitted",
    playerId: input.playerId,
    hint: normalizedHint
  };
  const nextSession = input.engine.applyEvent({
    session: input.session,
    event
  });

  return {
    status: hadHint ? "updated" : "submitted",
    session: nextSession
  };
}

export function getHintSubmissionProgress(state: JustOneState): HintSubmissionProgress {
  const hintPlayerIds = state.players.filter((playerId) => playerId !== state.guesserId);
  const submittedCount = hintPlayerIds.filter(
    (playerId) => state.hintsByPlayerId[playerId] !== undefined
  ).length;
  const totalCount = hintPlayerIds.length;

  return {
    submittedCount,
    totalCount,
    allSubmitted: totalCount > 0 && submittedCount === totalCount
  };
}

export function startDuplicateReview(input: StartDuplicateReviewInput): StartDuplicateReviewResult {
  const state = input.session.state as JustOneState;

  if (state.phase !== "hinting") {
    return { status: "invalidPhase" };
  }

  if (state.guesserId && state.hintsByPlayerId[state.guesserId] !== undefined) {
    return { status: "guesserHasHint" };
  }

  const progress = getHintSubmissionProgress(state);

  if (!progress.allSubmitted || Object.keys(state.hintsByPlayerId).length !== progress.totalCount) {
    return { status: "incompleteHints" };
  }

  const event: JustOneEvent = {
    type: "just-one.duplicateReviewStarted"
  };

  return {
    status: "started",
    session: input.engine.applyEvent({
      session: input.session,
      event
    })
  };
}

export function excludeHint(input: ReviewHintInput): ReviewHintResult {
  const validationResult = validateReviewHint(input);

  if (validationResult) {
    return validationResult;
  }

  const state = input.session.state as JustOneState;

  if (state.excludedHintPlayerIds.includes(input.playerId)) {
    return { status: "alreadyExcluded" };
  }

  return applyReviewHintEvent(
    input,
    {
      type: "just-one.hintExcluded",
      playerId: input.playerId
    },
    "excluded"
  );
}

export function restoreHint(input: ReviewHintInput): ReviewHintResult {
  const validationResult = validateReviewHint(input);

  if (validationResult) {
    return validationResult;
  }

  const state = input.session.state as JustOneState;

  if (!state.excludedHintPlayerIds.includes(input.playerId)) {
    return { status: "notExcluded" };
  }

  return applyReviewHintEvent(
    input,
    {
      type: "just-one.hintRestored",
      playerId: input.playerId
    },
    "restored"
  );
}

export function getDuplicateReviewHints(
  state: JustOneState
): readonly JustOneDuplicateReviewHint[] {
  return state.players.flatMap((playerId) => {
    const hint = state.hintsByPlayerId[playerId];

    if (playerId === state.guesserId || hint === undefined) {
      return [];
    }

    return [
      {
        playerId,
        hint,
        excluded: state.excludedHintPlayerIds.includes(playerId)
      }
    ];
  });
}

export function confirmDuplicateReview(
  input: ConfirmDuplicateReviewInput
): ConfirmDuplicateReviewResult {
  const state = input.session.state as JustOneState;

  if (state.phase !== "duplicateReview") {
    return { status: "invalidPhase" };
  }

  if (!isValidDuplicateReviewState(state)) {
    return { status: "invalidState" };
  }

  return {
    status: "confirmed",
    session: input.engine.applyEvent({
      session: input.session,
      event: { type: "just-one.duplicateReviewConfirmed" }
    })
  };
}

export function getRemainingHints(state: JustOneState): readonly JustOneRemainingHint[] {
  return getDuplicateReviewHints(state)
    .filter((hint) => !hint.excluded)
    .map(({ playerId, hint }) => ({ playerId, hint }));
}

export function submitGuess(input: SubmitGuessInput): SubmitGuessResult {
  const state = input.session.state as JustOneState;
  const guess = input.guess.trim();

  if (state.phase !== "guessing") {
    return { status: "invalidPhase" };
  }

  if (!input.session.players.some((player) => player.id === input.playerId)) {
    return { status: "notPlayer" };
  }

  if (state.guesserId !== input.playerId) {
    return { status: "notGuesser" };
  }

  if (guess.length === 0) {
    return { status: "emptyGuess" };
  }

  const event: JustOneEvent = {
    type: "just-one.guessSubmitted",
    guess
  };

  return {
    status: "submitted",
    session: input.engine.applyEvent({
      session: input.session,
      event
    })
  };
}

export function getRevealResult(state: JustOneState): GetRevealResult {
  if (
    (state.phase !== "answered" &&
      state.phase !== "resultConfirmed" &&
      state.phase !== "roundScored") ||
    !state.guesserId ||
    !state.guess ||
    !state.secretWord
  ) {
    return { status: "invalidState" };
  }

  return {
    status: "ready",
    guesserId: state.guesserId,
    guess: state.guess,
    secretWord: state.secretWord
  };
}

export function confirmResult(input: ConfirmResultInput): ConfirmResultResult {
  const state = input.session.state as JustOneState;

  if (state.phase !== "answered") {
    return { status: "invalidPhase" };
  }

  if (
    (input.result !== "correct" && input.result !== "incorrect") ||
    !state.guess ||
    !state.secretWord ||
    state.result !== null
  ) {
    return { status: "invalidState" };
  }

  const event: JustOneEvent = {
    type: "just-one.resultConfirmed",
    result: input.result
  };

  return {
    status: "confirmed",
    session: input.engine.applyEvent({
      session: input.session,
      event
    })
  };
}

export function getRoundPoints(state: JustOneState): number | undefined {
  if (state.result === "correct") {
    return 1;
  }

  if (state.result === "incorrect") {
    return 0;
  }
}

export function scoreRound(input: ScoreRoundInput): ScoreRoundResult {
  const state = input.session.state as JustOneState;

  if (state.phase !== "resultConfirmed") {
    return { status: "invalidPhase" };
  }

  const points = getRoundPoints(state);

  if (!state.guess || !state.secretWord || points === undefined) {
    return { status: "invalidState" };
  }

  const event: JustOneEvent = { type: "just-one.roundScored", points };

  return {
    status: "scored",
    points,
    session: input.engine.applyEvent({
      session: input.session,
      event
    })
  };
}

export function getNextGuesserId(state: JustOneState): PlayerId | undefined {
  if (!state.guesserId || state.players.length === 0) {
    return undefined;
  }

  const currentGuesserIndex = state.players.indexOf(state.guesserId);

  if (currentGuesserIndex === -1) {
    return undefined;
  }

  return state.players[(currentGuesserIndex + 1) % state.players.length];
}

export function startNextRound(input: StartNextRoundInput): StartNextRoundResult {
  const state = input.session.state as JustOneState;

  if (state.phase !== "roundScored") {
    return { status: "invalidPhase" };
  }

  const nextGuesserId = getNextGuesserId(state);

  if (state.roundNumber < 1 || state.players.length < 2 || !nextGuesserId) {
    return { status: "invalidState" };
  }

  const words = input.words ?? defaultWords;

  if (words.length === 0) {
    return { status: "noWords" };
  }

  const wordIndex = chooseValidRandomIndex(words.length, input.random);

  if (wordIndex === undefined) {
    return { status: "invalidState" };
  }

  const secretWord = words[wordIndex];

  if (!secretWord) {
    return { status: "invalidState" };
  }

  const event: JustOneEvent = {
    type: "just-one.nextRoundStarted",
    guesserId: nextGuesserId,
    secretWord
  };

  return {
    status: "started",
    session: input.engine.applyEvent({
      session: input.session,
      event
    })
  };
}

function validateReviewHint(
  input: ReviewHintInput
):
  | Exclude<
      ReviewHintResult,
      Readonly<{ status: "excluded" | "restored"; session: EngineGameSession }>
    >
  | undefined {
  const state = input.session.state as JustOneState;

  if (state.phase !== "duplicateReview") {
    return { status: "invalidPhase" };
  }

  if (!input.session.players.some((player) => player.id === input.playerId)) {
    return { status: "notPlayer" };
  }

  if (state.guesserId === input.playerId) {
    return { status: "guesserCannotReview" };
  }

  if (state.hintsByPlayerId[input.playerId] === undefined) {
    return { status: "hintNotFound" };
  }
}

function isValidDuplicateReviewState(state: JustOneState): boolean {
  if (!state.guesserId || !state.players.includes(state.guesserId)) {
    return false;
  }

  const progress = getHintSubmissionProgress(state);

  if (
    !progress.allSubmitted ||
    Object.keys(state.hintsByPlayerId).length !== progress.totalCount ||
    state.hintsByPlayerId[state.guesserId] !== undefined
  ) {
    return false;
  }

  return state.excludedHintPlayerIds.every(
    (playerId) =>
      playerId !== state.guesserId &&
      state.players.includes(playerId) &&
      state.hintsByPlayerId[playerId] !== undefined
  );
}

function applyReviewHintEvent(
  input: ReviewHintInput,
  event: JustOneEvent,
  status: "excluded" | "restored"
): ReviewHintResult {
  return {
    status,
    session: input.engine.applyEvent({
      session: input.session,
      event
    })
  };
}

function toEnginePlayers(playerIds: readonly PlayerId[]): readonly EnginePlayer[] {
  return playerIds.map((playerId) => ({ id: playerId }));
}

function chooseRandomGuesserId(players: readonly EnginePlayer[], random: JustOneRandom): PlayerId {
  if (players.length === 0) {
    throw new Error("Cannot start Just One without players");
  }
  const guesser = players[chooseRandomIndex(players.length, random)];

  if (!guesser) {
    throw new Error("Failed to choose a Just One guesser");
  }

  return guesser.id;
}

function chooseRandomWord(words: readonly string[], random: JustOneRandom): string {
  if (words.length === 0) {
    throw new Error("Cannot start Just One without secret words");
  }

  const secretWord = words[chooseRandomIndex(words.length, random)];

  if (!secretWord) {
    throw new Error("Failed to choose a Just One secret word");
  }

  return secretWord;
}

function chooseRandomIndex(length: number, random: JustOneRandom): number {
  return Math.min(Math.floor(random() * length), length - 1);
}

function chooseValidRandomIndex(length: number, random: JustOneRandom): number | undefined {
  const value = random();

  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    return undefined;
  }

  return Math.floor(value * length);
}
