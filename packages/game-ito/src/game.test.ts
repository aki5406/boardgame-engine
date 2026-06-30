import { describe, expect, it } from "vitest";

import {
  createItoEngine,
  itoGame,
  itoInitialState,
  reduceItoState,
  type ItoThemeSelectedEvent
} from "./index.js";

describe("ITO game", () => {
  it("provides the minimal initial state", () => {
    expect(itoInitialState).toEqual({
      phase: "waitingForPlayers",
      players: []
    });
  });

  it("updates state through the ITO reducer", () => {
    const event: ItoThemeSelectedEvent = {
      type: "ito.themeSelected",
      theme: "favorite food"
    };

    const nextState = reduceItoState(itoInitialState, event);

    expect(nextState).toEqual({
      phase: "themeSelected",
      players: [],
      theme: "favorite food"
    });
  });

  it("runs as an Engine game", () => {
    const engine = createItoEngine();
    const event: ItoThemeSelectedEvent = {
      type: "ito.themeSelected",
      theme: "favorite food"
    };
    const session = engine.startSession({
      id: "ito-session-1",
      players: [{ id: "player-1" }],
      initialState: itoInitialState
    });

    const nextSession = engine.applyEvent({
      session,
      event
    });

    expect(itoGame.id).toBe("ito");
    expect(nextSession.state).toEqual({
      phase: "themeSelected",
      players: [],
      theme: "favorite food"
    });
  });
});
