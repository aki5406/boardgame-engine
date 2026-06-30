import { describe, expect, it } from "vitest";

import { counterIncrementEvent, counterInitialState, createCounterEngine } from "./counter-game.js";

describe("counter sample", () => {
  it("increments count through the engine flow", () => {
    const engine = createCounterEngine();
    const session = engine.startSession({
      id: "counter-session-1",
      players: [{ id: "player-1" }],
      initialState: counterInitialState
    });

    const nextSession = engine.applyEvent({
      session,
      event: counterIncrementEvent
    });

    expect(nextSession.state).toEqual({ count: 1 });
  });
});
