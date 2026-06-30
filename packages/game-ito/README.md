# @boardgame/game-ito

`@boardgame/game-ito` is the future ITO game package for boardgame-engine.

This package will contain ITO-specific rules and state transitions on top of `@boardgame/engine`.

## Role

- Keep ITO-specific concepts out of `@boardgame/engine`.
- Provide the place for future ITO state, events, reducer, and game definition.
- Validate the Engine API through a real game implementation over time.

## Current Scope

This package currently contains only the minimal package structure needed to start ITO implementation later.

It intentionally does not include:

- ITO events
- ITO state
- ITO reducer
- Theme
- Card
- Player management
- Number distribution
- Judging logic
- CLI integration
- Discord integration
- Tests
