import {
  createEngine,
  type Engine,
  type EngineEvent,
  type EngineGame,
  type EngineReducer,
  type EngineState
} from "@boardgame/engine";

export type CounterState = EngineState &
  Readonly<{
    count: number;
  }>;

export type CounterIncrementEvent = EngineEvent &
  Readonly<{
    type: "increment";
  }>;

export type CounterEvent = CounterIncrementEvent;

export const counterInitialState: CounterState = {
  count: 0
};

export const counterIncrementEvent: CounterIncrementEvent = {
  type: "increment"
};

export const counterReducer: EngineReducer = (state, event) => {
  if (event.type !== "increment") {
    return state;
  }

  const currentCount = typeof state.count === "number" ? state.count : 0;

  return {
    ...state,
    count: currentCount + 1
  };
};

export const counterGame: EngineGame = {
  id: "counter",
  reducer: counterReducer
};

export function createCounterEngine(): Engine {
  return createEngine(counterGame);
}
