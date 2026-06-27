# AGENTS.md

Agents working in this repository must follow these rules.

## Working Style

- Human decides WHAT to build.
- Codex proposes HOW to build it.
- Architectural discussion is encouraged.
- Challenge assumptions respectfully.

## Core Rules

- Engine First: design the project as a reusable board game engine first.
- Treat Discord as an adapter.
- Game logic must not depend on Discord.
- Games should be based on Event + State Machine.
- Avoid premature abstraction.
- Apply the Rule of Three. Do not generalize until the same shape appears at least three times.
- Packages must not depend on apps.

## Dependency Direction

- `packages/*` contains reusable units such as the engine, shared types when justified, and utilities.
- `apps/*` contains runnable clients and applications such as CLI, Discord, and Web.
- `apps/*` may depend on `packages/*`.
- `packages/*` must not depend on `apps/*`.

## Implementation Notes

- Keep Discord-specific input/output, authentication, and message handling inside adapter layers.
- Think of the engine as receiving input events, transitioning state, and returning results.
- Introduce new abstractions only after real games or client implementations show the need.
