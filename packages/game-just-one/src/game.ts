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

export type JustOneRandom = () => number;

export const justOneInitialState: JustOneState = {
  phase: "waiting",
  players: [],
  guesserId: null,
  secretWord: null
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
  const guesserId = chooseRandomGuesserId(input.session.players, input.random ?? Math.random);
  const event: JustOneEvent = {
    type: "just-one.gameStarted",
    guesserId
  };

  return input.engine.applyEvent({
    session: input.session,
    event
  });
}

function toEnginePlayers(playerIds: readonly PlayerId[]): readonly EnginePlayer[] {
  return playerIds.map((playerId) => ({ id: playerId }));
}

function chooseRandomGuesserId(players: readonly EnginePlayer[], random: JustOneRandom): PlayerId {
  const playerCount = players.length;

  if (playerCount === 0) {
    throw new Error("Cannot start Just One without players");
  }

  const index = Math.min(Math.floor(random() * playerCount), playerCount - 1);
  const guesser = players[index];

  if (!guesser) {
    throw new Error("Failed to choose a Just One guesser");
  }

  return guesser.id;
}
