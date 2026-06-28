import type { EngineEvent } from "./event.js";
import type { EngineState } from "./state.js";

export type EngineReducer = (state: EngineState, event: EngineEvent) => EngineState;
