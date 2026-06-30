import { describe, expect, it } from "vitest";

import {
  createItoEngine,
  itoGame,
  itoInitialState,
  reduceItoState,
  type ItoEvent,
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

  it("runs the minimal one-round play flow through the engine", () => {
    const engine = createItoEngine();
    const session = engine.startSession({
      id: "ito-session-1",
      players: [{ id: "player-1" }, { id: "player-2" }],
      initialState: {
        ...itoInitialState,
        players: [{ id: "player-1" }, { id: "player-2" }]
      }
    });
    const events: readonly ItoEvent[] = [
      {
        type: "ito.themeSelected",
        theme: "favorite food"
      },
      {
        type: "ito.numbersAssigned",
        assignments: [
          { playerId: "player-1", number: 20 },
          { playerId: "player-2", number: 80 }
        ]
      },
      {
        type: "ito.hintSubmitted",
        playerId: "player-1",
        hint: "toast"
      },
      {
        type: "ito.hintSubmitted",
        playerId: "player-2",
        hint: "sushi"
      },
      {
        type: "ito.revealOrderSubmitted",
        playerIds: ["player-1", "player-2"]
      },
      {
        type: "ito.resultRevealed",
        success: true
      }
    ];

    const finishedSession = events.reduce(
      (currentSession, event) =>
        engine.applyEvent({
          session: currentSession,
          event
        }),
      session
    );

    expect(finishedSession.state).toEqual({
      phase: "resultRevealed",
      players: [{ id: "player-1" }, { id: "player-2" }],
      theme: "favorite food",
      assignedNumbers: [
        { playerId: "player-1", number: 20 },
        { playerId: "player-2", number: 80 }
      ],
      hints: [
        { playerId: "player-1", hint: "toast" },
        { playerId: "player-2", hint: "sushi" }
      ],
      revealOrder: ["player-1", "player-2"],
      result: {
        success: true
      }
    });
  });
});
