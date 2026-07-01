import {
  createItoNumberAssignments,
  createItoThemeSelectedEvent,
  itoInitialState,
  judgeItoOrder,
  type ItoEvent,
  type ItoState
} from "@boardgame/game-ito";

const players = [{ id: "player-a" }, { id: "player-b" }, { id: "player-c" }];
const playerIds = players.map((player) => player.id);
const theme = "コンビニで買える嬉しいもの";
const assignedNumbers = createItoNumberAssignments({
  playerIds,
  numbers: [10, 30, 20]
});
const submittedOrder = ["player-a", "player-c", "player-b"];

export const itoCliPlaygroundScenario = {
  sessionId: "ito-cli-playground",
  players,
  initialState: {
    ...itoInitialState,
    players
  } satisfies ItoState,
  events: [
    createItoThemeSelectedEvent(theme),
    {
      type: "ito.numbersAssigned",
      assignments: assignedNumbers
    },
    {
      type: "ito.discussionStarted"
    },
    {
      type: "ito.hintSubmitted",
      playerId: "player-a",
      hint: "チョコ"
    },
    {
      type: "ito.hintSubmitted",
      playerId: "player-b",
      hint: "雑誌"
    },
    {
      type: "ito.hintSubmitted",
      playerId: "player-c",
      hint: "アイス"
    },
    {
      type: "ito.orderSubmissionStarted"
    },
    {
      type: "ito.orderSubmitted",
      playerIds: submittedOrder
    },
    judgeItoOrder({
      assignedNumbers,
      submittedOrder
    })
  ] satisfies readonly ItoEvent[]
} as const;
