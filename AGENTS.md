# AGENTS.md

## Project

`boardgame-engine` is a TypeScript / pnpm monorepo for a reusable board game engine that can serve multiple clients.

Discord, CLI, and Web clients are adapters. Keep game rules and state transitions in client-independent `packages/*` code.

## Repository Map

- `packages/engine`: client- and game-independent engine core.
- `packages/game-*`: game-specific event, state, reducer, and game definitions.
- `packages/counter-sample`: minimal sample for validating the engine API.
- `apps/*`: executable adapters, such as CLI and Discord clients.
- `docs/decisions`: accepted Architecture Decision Records (ADRs).
- `docs/architecture.md`: architecture of the implemented system.
- `docs/roadmap.md`: future direction.
- `docs/review-guidelines.md`: pull request review criteria.

## Architecture Rules

- **Engine First:** design around a reusable engine.
- **Game logic:** put game-specific rules in the matching `packages/game-*` package.
- **Adapter boundary:** keep Discord-specific input/output, authentication, presentation, and message handling in `apps/*`.
- **Dependency direction:** `apps/*` may depend on `packages/*`; `packages/*` must not depend on `apps/*`.
- **Event + State Machine:** represent game flow as events that transition state.
- **Pure reducers:** reducers derive the next state from state and event. Do not put external I/O, presentation, Discord APIs, or random generation in reducers.
- **Simplicity:** follow YAGNI and the Rule of Three. Do not generalize solely for anticipated future use before three real examples demonstrate the need.

Accepted decisions in `docs/decisions/` are repository truth. When a change affects one, decide whether it needs an ADR update and include it when needed.

## Implementation Workflow

1. Read the relevant implementation, tests, README, and ADRs before editing.
2. Choose the smallest change that satisfies the task. Do not mix in unrelated refactors.
3. Add or update focused tests when behavior changes.
4. Update relevant README or documentation when a public API, state transition, or user-facing behavior changes.
5. Run `pnpm check` before completing the task.

If you discover worthwhile work outside the task, do not implement it opportunistically. List it as a follow-up instead.

## Commands

- Full verification: `pnpm check`
- Type check: `pnpm typecheck`
- Tests: `pnpm test`
- Lint: `pnpm lint`
- Format check: `pnpm format:check`
- Format: `pnpm format`
- ITO playground: `pnpm ito:playground`

## Change Boundaries

Unless the task explicitly requires it, do not change:

- dependency direction;
- accepted ADR decisions;
- public API compatibility;
- GitHub Actions permissions, secrets, or execution model;
- package manager, Node.js, or TypeScript configuration at broad scope.

Ask before external writes, pull request creation, pushing, merging, destructive operations, or material scope expansion.

## Completion Report

When completing a task, report:

- what changed;
- design decisions and any ADR impact;
- verification run and its result;
- verification not run and why;
- follow-ups.
