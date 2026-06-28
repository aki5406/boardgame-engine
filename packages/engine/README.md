# @boardgame/engine

`@boardgame/engine` is the future core package for boardgame-engine.

This package will contain client-independent game engine logic that can be used from Discord, CLI, Web, and other adapters.

## Role

- Provide the central place for engine code.
- Keep game logic independent from any client or transport.
- Support an Event Driven and State Machine based design over time.
- Make core behavior testable without Discord, CLI, or Web dependencies.

## Future Responsibilities

- Define engine-facing concepts when they are needed by real use cases.
- Host state transition logic once the project is ready to implement it.
- Provide stable boundaries for adapters to call into the engine.
- Keep implementation decisions small and grounded in actual games.

## Public API

The current public API exports:

- `Engine`: a placeholder for the package boundary.
- `EngineEvent`: a minimal domain event shape with a `type` field.
- `EngineState`: a minimal readonly state snapshot shape.

`EngineEvent` represents something that happened in the engine domain. It does not define payloads, handlers, event sourcing, state transitions, or transport-specific behavior.

`EngineEvent` is readonly because events represent facts that have already happened in the engine domain.

`EngineState` represents a readonly snapshot of engine-domain state at a point in time. It does not define mutable internal state, reducers, lifecycle, persistence, rendering, or client-specific behavior.

## Not Implemented Yet

This package intentionally does not implement any engine behavior yet.

It does not include:

- Event payloads
- State transitions
- Reducer
- Game
- GameSession
- Player
- Lobby
- Renderer
- Rule
- Engine class
- Discord integration
- CLI integration
- Tests
- Sample code

The current goal is only to create the minimal package structure so future PRs can add behavior deliberately.
