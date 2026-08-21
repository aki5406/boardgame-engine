# @boardgame/game-just-one

Minimal Just One game package for the boardgame engine monorepo.

This package currently provides:

- `JustOneState`
- `JustOnePhase`
- `createGame()`
- `joinGame()`
- `startGame()`

`JustOneState.roundNumber` is the source of truth for the current round. It is `0` before a game starts, becomes `1` on the first start, and increments when a scored round starts the next round.

The current scope is intentionally small and only establishes the state model and the first session helpers.
