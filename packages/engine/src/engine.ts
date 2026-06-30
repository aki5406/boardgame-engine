import type { EngineEvent } from "./event.js";
import type { EngineGame } from "./game.js";
import type { EngineGameSession } from "./game-session.js";
import type { EnginePlayer } from "./player.js";
import type { EngineState } from "./state.js";

export interface Engine {
  readonly game: EngineGame;

  startSession(input: EngineStartSessionInput): EngineGameSession;
  applyEvent(input: EngineApplyEventInput): EngineGameSession;
}

export interface EngineStartSessionInput {
  readonly id: string;
  readonly players: readonly EnginePlayer[];
  readonly initialState: EngineState;
}

export interface EngineApplyEventInput {
  readonly session: EngineGameSession;
  readonly event: EngineEvent;
}

export function createEngine(game: EngineGame): Engine {
  return {
    game,

    startSession(input) {
      return {
        id: input.id,
        game,
        players: input.players,
        state: input.initialState
      };
    },

    applyEvent(input) {
      return {
        ...input.session,
        state: game.reducer(input.session.state, input.event)
      };
    }
  };
}
