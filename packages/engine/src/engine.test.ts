import { describe, expect, it } from "vitest";

import { createEngine, type EngineEvent, type EngineGame, type EngineState } from "./index.js";

describe("createEngine", () => {
  it("starts a session and applies an event through the game reducer", () => {
    const game: EngineGame = {
      id: "counter",
      reducer(state: EngineState, event: EngineEvent): EngineState {
        if (event.type !== "increment") {
          return state;
        }

        const currentCount = typeof state.count === "number" ? state.count : 0;

        return {
          ...state,
          count: currentCount + 1
        };
      }
    };

    const engine = createEngine(game);
    const session = engine.startSession({
      id: "session-1",
      players: [{ id: "player-1" }],
      initialState: { count: 0 }
    });

    const nextSession = engine.applyEvent({
      session,
      event: { type: "increment" }
    });

    expect(nextSession).toEqual({
      ...session,
      state: { count: 1 }
    });
  });
});
