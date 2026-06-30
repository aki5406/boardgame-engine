import { createEngine, type Engine, type EngineGame } from "@boardgame/engine";

import { itoReducer } from "./reducer.js";
import type { ItoState } from "./state.js";

export const itoInitialState: ItoState = {
  phase: "waitingForPlayers",
  players: []
};

export const itoGame: EngineGame = {
  id: "ito",
  reducer: itoReducer
};

export function createItoEngine(): Engine {
  return createEngine(itoGame);
}
