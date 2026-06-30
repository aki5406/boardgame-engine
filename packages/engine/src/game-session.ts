import type { EngineGame } from "./game.js";
import type { EngineState } from "./state.js";

export interface EngineGameSession {
  readonly id: string;
  readonly game: EngineGame;
  readonly state: EngineState;
}
