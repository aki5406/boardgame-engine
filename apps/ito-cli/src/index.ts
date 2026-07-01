import { createItoEngine } from "@boardgame/game-ito";

import { itoCliPlaygroundScenario } from "./scenario.js";

const engine = createItoEngine();
const session = engine.startSession({
  id: itoCliPlaygroundScenario.sessionId,
  players: itoCliPlaygroundScenario.players,
  initialState: itoCliPlaygroundScenario.initialState
});

const finishedSession = itoCliPlaygroundScenario.events.reduce(
  (currentSession, event) =>
    engine.applyEvent({
      session: currentSession,
      event
    }),
  session
);

console.log(
  JSON.stringify(
    {
      gameId: engine.game.id,
      sessionId: finishedSession.id,
      finalState: finishedSession.state
    },
    null,
    2
  )
);
