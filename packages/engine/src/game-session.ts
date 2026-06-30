import type { EngineGame } from "./game.js";
import type { EnginePlayer } from "./player.js";
import type { EngineState } from "./state.js";

export interface EngineGameSession {
  readonly id: string;
  readonly game: EngineGame;
  readonly players: readonly EnginePlayer[];
  readonly state: EngineState;
}
