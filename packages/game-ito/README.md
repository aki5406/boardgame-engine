# @boardgame/game-ito

`@boardgame/game-ito` is the future ITO game package for boardgame-engine.

This package will contain ITO-specific rules and state transitions on top of `@boardgame/engine`.

## Role

- Keep ITO-specific concepts out of `@boardgame/engine`.
- Provide the place for future ITO state, events, reducer, and game definition.
- Validate the Engine API through a real game implementation over time.

## Current Scope

This package currently contains only the minimal package structure needed to start ITO implementation later.

The current public API exports:

- `ItoEvent`: the union of ITO-specific events that can drive future state transitions.
- `ItoThemeSelectedEvent`: records the selected theme text for a round.
- `ItoNumbersAssignedEvent`: records which hidden number was assigned to each player.
- `ItoHintSubmittedEvent`: records a player's hint for the selected theme.
- `ItoRevealOrderSubmittedEvent`: records the reveal order chosen by the group.
- `ItoResultRevealedEvent`: records the revealed round result.
- `ItoNumberAssignment`: the player-to-number pair used by `ItoNumbersAssignedEvent`.

`ItoEvent` is built on top of `EngineEvent`. Each ITO event keeps the engine-level `type` field and narrows it to an ITO-specific event name.

It intentionally does not include:

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
