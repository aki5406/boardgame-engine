# @boardgame/game-just-one

Minimal Just One game package for the boardgame engine monorepo.

This package currently provides:

- `JustOneState`
- `JustOnePhase`
- `createGame()`
- `joinGame()`
- `startGame()`

`JustOneState.roundNumber` is the source of truth for the current round. It is `0` before a game starts, becomes `1` on the first start, and increments when a scored round starts the next round.

Just One is limited to 13 rounds. After scoring round 13, `finishGame()` transitions the Engine State from `roundScored` to `finished`; the final score remains in `JustOneState.score`.

`getScoreEvaluation(score)` derives the final score message from a valid integer score between 0 and 13. The message is not stored in state.

The current scope is intentionally small and only establishes the state model and the first session helpers.
