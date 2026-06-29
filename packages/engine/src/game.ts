import type { EngineReducer } from "./reducer.js";

export interface EngineGame {
  readonly id: string;
  readonly reducer: EngineReducer;
}
