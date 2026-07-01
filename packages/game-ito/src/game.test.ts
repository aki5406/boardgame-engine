import { describe, expect, it } from "vitest";

import {
  createItoNumberAssignments,
  createItoThemeSelectedEvent,
  createItoEngine,
  itoGame,
  itoInitialState,
  judgeItoOrder,
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
    const assignments = createItoNumberAssignments({
      playerIds: ["player-a", "player-b", "player-c"],
      numbers: [10, 30, 20]
    });

    const nextState = reduceItoState(itoInitialState, {
      type: "ito.numbersAssigned",
      assignments
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

  it("creates number assignments from player ids and prepared numbers", () => {
    expect(
      createItoNumberAssignments({
        playerIds: ["player-a", "player-b", "player-c"],
        numbers: [10, 30, 20]
      })
    ).toEqual([
      { playerId: "player-a", number: 10 },
      { playerId: "player-b", number: 30 },
      { playerId: "player-c", number: 20 }
    ]);
  });

  it("creates theme selected events from selected theme text", () => {
    expect(createItoThemeSelectedEvent("favorite food")).toEqual({
      type: "ito.themeSelected",
      theme: "favorite food"
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

  it("starts order submission through the ITO reducer", () => {
    const nextState = reduceItoState(
      {
        ...itoInitialState,
        phase: "discussion",
        hints: [{ playerId: "player-a", hint: "toast" }]
      },
      {
        type: "ito.orderSubmissionStarted"
      }
    );

    expect(nextState).toEqual({
      phase: "orderSubmission",
      players: [],
      hints: [{ playerId: "player-a", hint: "toast" }]
    });
  });

  it("runs as an Engine game", () => {
    const engine = createItoEngine();
    const event: ItoThemeSelectedEvent = createItoThemeSelectedEvent("favorite food");
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
      createItoThemeSelectedEvent("favorite food"),
      {
        type: "ito.numbersAssigned",
        assignments: createItoNumberAssignments({
          playerIds: ["player-1", "player-2"],
          numbers: [20, 80]
        })
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
        type: "ito.orderSubmissionStarted"
      },
      {
        type: "ito.orderSubmitted",
        playerIds: ["player-1", "player-2"]
      },
      judgeItoOrder({
        assignedNumbers: [
          { playerId: "player-1", number: 20 },
          { playerId: "player-2", number: 80 }
        ],
        submittedOrder: ["player-1", "player-2"]
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
      submittedOrder: ["player-1", "player-2"],
      result: {
        success: true
      }
    });
  });

  it("judges submitted order by assigned numbers", () => {
    expect(
      judgeItoOrder({
        assignedNumbers: [
          { playerId: "player-a", number: 10 },
          { playerId: "player-b", number: 30 },
          { playerId: "player-c", number: 20 }
        ],
        submittedOrder: ["player-a", "player-c", "player-b"]
      })
    ).toEqual({
      type: "ito.resultRevealed",
      success: true
    });

    expect(
      judgeItoOrder({
        assignedNumbers: [
          { playerId: "player-a", number: 10 },
          { playerId: "player-b", number: 30 },
          { playerId: "player-c", number: 20 }
        ],
        submittedOrder: ["player-a", "player-b", "player-c"]
      })
    ).toEqual({
      type: "ito.resultRevealed",
      success: false
    });
  });

  it("judges submitted order using assigned numbers stored in state", () => {
    const numbersAssignedState = reduceItoState(itoInitialState, {
      type: "ito.numbersAssigned",
      assignments: [
        { playerId: "player-a", number: 10 },
        { playerId: "player-b", number: 30 },
        { playerId: "player-c", number: 20 }
      ]
    });
    const orderSubmittedState = reduceItoState(numbersAssignedState, {
      type: "ito.orderSubmitted",
      playerIds: ["player-a", "player-c", "player-b"]
    });

    const resultEvent = judgeItoOrder({
      assignedNumbers: orderSubmittedState.assignedNumbers ?? [],
      submittedOrder: orderSubmittedState.submittedOrder ?? []
    });
    const resultState = reduceItoState(orderSubmittedState, resultEvent);

    expect(resultState).toEqual({
      phase: "resultRevealed",
      players: [],
      assignedNumbers: [
        { playerId: "player-a", number: 10 },
        { playerId: "player-b", number: 30 },
        { playerId: "player-c", number: 20 }
      ],
      submittedOrder: ["player-a", "player-c", "player-b"],
      result: {
        success: true
      }
    });
  });
});
