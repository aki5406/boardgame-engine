import { describe, expect, it } from "vitest";

import {
  createItoEngine,
  itoGame,
  itoInitialState,
  judgeItoRevealOrder,
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

  it("stores selected theme through the ITO reducer", () => {
    const event: ItoThemeSelectedEvent = {
      type: "ito.themeSelected",
      theme: "コンビニで買える嬉しいもの"
    };

    const nextState = reduceItoState(itoInitialState, event);

    expect(nextState).toEqual({
      phase: "themeSelected",
      players: [],
      theme: "コンビニで買える嬉しいもの"
    });
  });

  it("stores assigned numbers through the ITO reducer", () => {
    const nextState = reduceItoState(itoInitialState, {
      type: "ito.numbersAssigned",
      assignments: [
        { playerId: "player-a", number: 10 },
        { playerId: "player-b", number: 30 },
        { playerId: "player-c", number: 20 }
      ]
    });

    expect(nextState).toEqual({
      phase: "numbersAssigned",
      players: [],
      assignedNumbers: [
        { playerId: "player-a", number: 10 },
        { playerId: "player-b", number: 30 },
        { playerId: "player-c", number: 20 }
      ]
    });
  });

  it("starts discussion through the ITO reducer", () => {
    const nextState = reduceItoState(
      {
        ...itoInitialState,
        phase: "numbersAssigned",
        assignedNumbers: [{ playerId: "player-a", number: 10 }]
      },
      {
        type: "ito.discussionStarted"
      }
    );

    expect(nextState).toEqual({
      phase: "discussion",
      players: [],
      assignedNumbers: [{ playerId: "player-a", number: 10 }]
    });
  });

  it("stores hints while staying in discussion", () => {
    const nextState = reduceItoState(
      {
        ...itoInitialState,
        phase: "discussion"
      },
      {
        type: "ito.hintSubmitted",
        playerId: "player-a",
        hint: "toast"
      }
    );

    expect(nextState).toEqual({
      phase: "discussion",
      players: [],
      hints: [{ playerId: "player-a", hint: "toast" }]
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
        type: "ito.discussionStarted"
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
      judgeItoRevealOrder({
        assignedNumbers: [
          { playerId: "player-1", number: 20 },
          { playerId: "player-2", number: 80 }
        ],
        revealOrder: ["player-1", "player-2"]
      })
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

  it("judges submitted order by assigned numbers", () => {
    expect(
      judgeItoRevealOrder({
        assignedNumbers: [
          { playerId: "player-a", number: 10 },
          { playerId: "player-b", number: 30 },
          { playerId: "player-c", number: 20 }
        ],
        revealOrder: ["player-a", "player-c", "player-b"]
      })
    ).toEqual({
      type: "ito.resultRevealed",
      success: true
    });

    expect(
      judgeItoRevealOrder({
        assignedNumbers: [
          { playerId: "player-a", number: 10 },
          { playerId: "player-b", number: 30 },
          { playerId: "player-c", number: 20 }
        ],
        revealOrder: ["player-a", "player-b", "player-c"]
      })
    ).toEqual({
      type: "ito.resultRevealed",
      success: false
    });
  });

  it("judges reveal order using assigned numbers stored in state", () => {
    const numbersAssignedState = reduceItoState(itoInitialState, {
      type: "ito.numbersAssigned",
      assignments: [
        { playerId: "player-a", number: 10 },
        { playerId: "player-b", number: 30 },
        { playerId: "player-c", number: 20 }
      ]
    });
    const revealOrderSubmittedState = reduceItoState(numbersAssignedState, {
      type: "ito.revealOrderSubmitted",
      playerIds: ["player-a", "player-c", "player-b"]
    });

    const resultEvent = judgeItoRevealOrder({
      assignedNumbers: revealOrderSubmittedState.assignedNumbers ?? [],
      revealOrder: revealOrderSubmittedState.revealOrder ?? []
    });
    const resultState = reduceItoState(revealOrderSubmittedState, resultEvent);

    expect(resultState).toEqual({
      phase: "resultRevealed",
      players: [],
      assignedNumbers: [
        { playerId: "player-a", number: 10 },
        { playerId: "player-b", number: 30 },
        { playerId: "player-c", number: 20 }
      ],
      revealOrder: ["player-a", "player-c", "player-b"],
      result: {
        success: true
      }
    });
  });
});
