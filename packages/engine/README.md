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

- `Engine`: a minimal entry point for starting sessions and applying events for one game.
- `EngineStartSessionInput`: the input required to create an engine-domain session snapshot.
- `EngineApplyEventInput`: the input required to apply one event to one session snapshot.
- `EngineEvent`: a minimal domain event shape with a `type` field.
- `EngineState`: a minimal readonly state snapshot shape.
- `EngineReducer`: a function type that describes state transition shape.
- `EngineGame`: a minimal game definition with a stable `id` and reducer.
- `EnginePlayer`: a minimal participant identity for the engine domain.
- `EngineGameSession`: a minimal session snapshot for one play of a game.

`EngineEvent` represents something that happened in the engine domain. It does not define payloads, handlers, event sourcing, state transitions, or transport-specific behavior.

`EngineEvent` is readonly because events represent facts that have already happened in the engine domain.

`EngineState` represents a readonly snapshot of engine-domain state at a point in time. It does not define mutable internal state, reducers, lifecycle, persistence, rendering, or client-specific behavior.

`EngineReducer` represents the shape of a state transition from `EngineState` and `EngineEvent` to the next `EngineState`. It does not define execution, dispatch, validation, effects, persistence, or error handling.

`EngineGame` represents a game definition in the engine domain. It connects a stable game identity to the reducer that describes that game's state transition shape. It does not define sessions, players, turns, phases, rendering, adapters, or runtime execution.

`EnginePlayer` represents a participant in the engine domain. It is not a Discord user, CLI user, AI implementation, role, team, or authentication identity.

`EngineGameSession` represents one play of an `EngineGame` at a point in time. It connects a stable session identity to the game being played, the participating engine players, and the current readonly state snapshot. It does not define roles, teams, turns, phases, dispatch, event history, persistence, adapters, or runtime execution.

`Engine` represents the engine-domain entry point for one `EngineGame`. It owns the boundary where adapters can ask the engine to start an `EngineGameSession` and apply an `EngineEvent` to an existing `EngineGameSession`. It relates the existing concepts without introducing session storage, scheduling, persistence, transport behavior, or adapter-specific dependencies.

`EngineStartSessionInput` connects a session identity, engine players, and an initial state snapshot. It does not define matchmaking, lobbies, authentication, persistence, or game-specific setup rules.

`EngineApplyEventInput` connects an existing session snapshot to one engine event. It does not define event queues, subscriptions, effect handling, persistence, or external delivery.

## Not Implemented Yet

This package intentionally does not implement any engine behavior yet.

It does not include:

- Event payloads
- State transition implementation
- Reducer implementation
- Concrete Engine implementation
- Game runtime implementation
- GameSession runtime implementation
- Player runtime implementation
- Lobby
- Renderer
- Rule
- Discord integration
- CLI integration
- Tests
- Sample code

The current goal is only to create the minimal package structure so future PRs can add behavior deliberately.
