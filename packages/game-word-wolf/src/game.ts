import {
  createEngine,
  type Engine,
  type EngineGame,
  type EngineGameSession
} from "@boardgame/engine";

import type { WordWolfEvent } from "./event.js";
import { wordWolfReducer } from "./reducer.js";
import { wordWolfInitialState, type PlayerId, type WordWolfState } from "./state.js";

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
  | Readonly<{ status: "invalidPhase" }>;

export interface StartGameInput {
  readonly engine: Engine;
  readonly session: EngineGameSession;
}

export type StartGameResult =
  | Readonly<{ status: "started"; session: EngineGameSession }>
  | Readonly<{ status: "invalidPhase" }>
  | Readonly<{ status: "notEnoughPlayers" }>;

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

  const event: WordWolfEvent = { type: "word-wolf.gameStarted" };
  const session = input.engine.applyEvent({
    session: input.session,
    event
  });

  return { status: "started", session };
}
