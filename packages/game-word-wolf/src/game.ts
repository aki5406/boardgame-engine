import {
  createEngine,
  type Engine,
  type EngineGame,
  type EngineGameSession
} from "@boardgame/engine";

import type { WordWolfEvent } from "./event.js";
import { wordWolfReducer } from "./reducer.js";
import { wordWolfInitialState, type PlayerId, type WordWolfState } from "./state.js";
import { defaultWordPairs, type WordWolfWordPair } from "./words.js";

export type WordWolfRandom = () => number;
export const MAX_WORD_WOLF_PLAYERS = 25;

export const wordWolfGame: EngineGame = {
  id: "word-wolf",
  reducer: wordWolfReducer
};

export interface CreateGameInput {
  readonly engine: Engine;
  readonly id: string;
}

export interface JoinGameInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly playerId: PlayerId;
}

export type JoinGameResult =
  | Readonly<{ status: "joined"; session: EngineGameSession }>
  | Readonly<{ status: "alreadyJoined" }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "playerLimitReached" }>;

export interface StartGameInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly random: WordWolfRandom;
  readonly wordPairs?: readonly WordWolfWordPair[];
}

export type StartGameResult =
  | Readonly<{ status: "started"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "notEnoughPlayers" }>
  | Readonly<{ status: "playerLimitExceeded" }>
  | Readonly<{ status: "noWordPairs" }>;

export interface StartVotingInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly playerId: PlayerId;
}

export type StartVotingResult =
  | Readonly<{ status: "started"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "notParticipant" }>;

export interface SubmitVoteInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
  readonly voterPlayerId: PlayerId;
  readonly targetPlayerId: PlayerId;
}

export type SubmitVoteResult =
  | Readonly<{ status: "submitted"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "voterNotParticipant" }>
  | Readonly<{ status: "targetNotParticipant" }>
  | Readonly<{ status: "selfVote" }>
  | Readonly<{ status: "alreadyVoted" }>;

export interface VoteProgress {
  readonly submitted: number;
  readonly total: number;
  readonly complete: boolean;
}

export function createWordWolfEngine(): Engine {
  return createEngine(wordWolfGame);
}

export function createGame(input: CreateGameInput): EngineGameSession {
  const session = input.engine.startSession({
    id: input.id,
    players: [],
    initialState: wordWolfInitialState
  });
  const event: WordWolfEvent = { type: "word-wolf.gameCreated" };

  return input.engine.applyEvent({ session, event });
}

export function joinGame(input: JoinGameInput): JoinGameResult {
  const state = input.session.state as WordWolfState;

  if (state.phase !== "waiting") {
    return { status: "invalidPhase" };
  }

  if (state.players.includes(input.playerId)) {
    return { status: "alreadyJoined" };
  }

  if (state.players.length >= MAX_WORD_WOLF_PLAYERS) {
    return { status: "playerLimitReached" };
  }

  const event: WordWolfEvent = {
    type: "word-wolf.playerJoined",
    playerId: input.playerId
  };
  const nextState = input.engine.applyEvent({
    session: input.session,
    event
  }).state;
  const session = input.engine.startSession({
    id: input.session.id,
    players: [...input.session.players, { id: input.playerId }],
    initialState: nextState
  });

  return { status: "joined", session };
}

export function startGame(input: StartGameInput): StartGameResult {
  const state = input.session.state as WordWolfState;

  if (state.phase !== "waiting") {
    return { status: "invalidPhase" };
  }

  if (state.players.length < 3) {
    return { status: "notEnoughPlayers" };
  }

  if (state.players.length > MAX_WORD_WOLF_PLAYERS) {
    return { status: "playerLimitExceeded" };
  }

  const wordPairs = input.wordPairs ?? defaultWordPairs;

  if (wordPairs.length === 0) {
    return { status: "noWordPairs" };
  }

  const minorityPlayerId = selectRandomItem(state.players, input.random);
  const wordPair = selectRandomItem(wordPairs, input.random);
  const [firstWord, secondWord] = wordPair.words;
  const [majorityWord, minorityWord] =
    input.random() < 0.5 ? [firstWord, secondWord] : [secondWord, firstWord];
  const event: WordWolfEvent = {
    type: "word-wolf.gameStarted",
    minorityPlayerId,
    majorityWord,
    minorityWord
  };
  const session = input.engine.applyEvent({
    session: input.session,
    event
  });

  return { status: "started", session };
}

export function getAssignedWord(state: WordWolfState, playerId: PlayerId): string | undefined {
  if (
    !state.players.includes(playerId) ||
    state.minorityPlayerId === null ||
    state.majorityWord === null ||
    state.minorityWord === null
  ) {
    return undefined;
  }

  return playerId === state.minorityPlayerId ? state.minorityWord : state.majorityWord;
}

export function startVoting(input: StartVotingInput): StartVotingResult {
  const state = input.session.state as WordWolfState;

  if (state.phase !== "discussion") {
    return { status: "invalidPhase" };
  }

  if (!state.players.includes(input.playerId)) {
    return { status: "notParticipant" };
  }

  const event: WordWolfEvent = { type: "word-wolf.votingStarted" };
  const session = input.engine.applyEvent({
    session: input.session,
    event
  });

  return { status: "started", session };
}

export function submitVote(input: SubmitVoteInput): SubmitVoteResult {
  const state = input.session.state as WordWolfState;

  if (state.phase !== "voting") {
    return { status: "invalidPhase" };
  }

  if (!state.players.includes(input.voterPlayerId)) {
    return { status: "voterNotParticipant" };
  }

  if (!state.players.includes(input.targetPlayerId)) {
    return { status: "targetNotParticipant" };
  }

  if (input.voterPlayerId === input.targetPlayerId) {
    return { status: "selfVote" };
  }

  if (input.voterPlayerId in state.votesByPlayerId) {
    return { status: "alreadyVoted" };
  }

  const event: WordWolfEvent = {
    type: "word-wolf.voteSubmitted",
    voterPlayerId: input.voterPlayerId,
    targetPlayerId: input.targetPlayerId
  };
  const session = input.engine.applyEvent({
    session: input.session,
    event
  });

  return { status: "submitted", session };
}

export function getVoteProgress(state: WordWolfState): VoteProgress {
  const submitted = state.players.filter((playerId) => playerId in state.votesByPlayerId).length;
  const total = state.players.length;

  return {
    submitted,
    total,
    complete: total > 0 && submitted === total
  };
}

function selectRandomItem<T>(items: readonly T[], random: WordWolfRandom): T {
  return items[Math.floor(random() * items.length)]!;
}
