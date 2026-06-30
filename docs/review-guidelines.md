# Review Guidelines

This document defines the review policy for human reviewers and future AI reviewer automation.

The AI reviewer should help reviewers notice design risks, missing verification, and scope drift. It must not replace human judgment.

## Core Principles

### Engine First

- Review whether the change keeps the reusable board game engine at the center.
- Game logic should be expressed in packages that can be used by multiple clients.
- Client-specific behavior should not leak into engine-domain code.

### Discord Is An Adapter

- Discord-specific input, output, authentication, message handling, and presentation belong in an adapter.
- Engine and game packages must not depend on Discord concepts.
- If a PR introduces Discord concepts into `packages/*`, reviewers should ask whether the logic belongs in `apps/*` instead.

### Event + State Machine

- Game behavior should be modeled as events that transition state.
- Reducers and state transitions should remain testable without external clients.
- New state or event concepts should be introduced only when the current game flow needs them.

### Rule Of Three

- Avoid generalizing after one example.
- Prefer local, game-specific implementation until the same shape appears across three real needs.
- AI reviewer comments should call out early abstraction as a risk, not as an automatic blocker.

### YAGNI

- Do not add infrastructure before the project has a clear need.
- Avoid SessionManager, EventBus, Scheduler, Persistence, adapters, and runtime services unless the PR goal explicitly requires them.
- Keep PRs small and aligned with their stated goal.

### Dependency Direction

- `apps/*` may depend on `packages/*`.
- `packages/*` must not depend on `apps/*`.
- Reusable engine, game, shared type, and test-support code should live under `packages/*`.
- Executable clients such as CLI, Discord, and Web should live under `apps/*`.

### ADR Consistency

Reviewers should compare PRs with accepted ADRs in `docs/decisions`.

Current accepted decisions:

- `0001-use-monorepo`: use pnpm Workspace and keep dependency direction clear.
- `0002-use-typescript`: use TypeScript while avoiding overly complex type design.
- `0003-engine-first`: treat Discord as an adapter and keep game logic client-independent.
- `0004-event-driven`: use Event + State Machine, adding implementation only when needed.

If a PR changes one of these architectural directions, it should either update an ADR or clearly explain why no ADR update is needed.

## PR Review Checklist

### Scope

- Does the PR match its stated goal?
- Does it include unrelated refactors or metadata churn?
- Does it avoid explicitly out-of-scope features?
- Is the PR small enough to review confidently?

### Public API

- Is the public API understandable from a caller's point of view?
- Are names consistent with existing engine-domain terms?
- Does the API avoid committing to lifecycle, persistence, or adapter details too early?
- Are runtime exports and type-only exports separated where appropriate?

### Domain Boundaries

- Are Engine responsibilities separate from game-specific responsibilities?
- Are game-specific rules kept out of Engine unless multiple games prove the need?
- Are adapter-specific concerns kept out of packages?
- Are private-information or presentation concerns kept out of Engine?

### State Transitions

- Does the PR preserve the Event + State Machine direction?
- Are state transitions deterministic and testable?
- Are invalid states, invalid events, and future error handling called out when relevant?
- Does the reducer or flow avoid hidden side effects unless the PR explicitly introduces them?

### Tests And Verification

- Does the PR include focused tests when behavior changes?
- For docs-only PRs, is it clear why tests are not needed beyond repository checks?
- Did the PR run `pnpm format` and `pnpm check`?
- Does the PR body include a Verification section with the checks that were actually run?

### Documentation

- Does the README need to be updated?
- Does the PR body explain why the change exists?
- Does the PR body list meaningful design decisions and tradeoffs?
- Does the PR state whether ADRs were updated?

## AI Reviewer Focus

The AI reviewer should prioritize:

- Scope drift from the PR goal.
- Violations of Engine First.
- Discord or adapter concerns leaking into Engine or game packages.
- `packages/* -> apps/*` dependencies.
- Over-generalization before Rule of Three evidence.
- Missing or unclear state transition tests.
- Public API ambiguity.
- Missing README, PR body, Verification, or ADR explanation.
- Security risks in GitHub Actions, secrets, and automation.
- Cases where the reviewer should ask a question rather than demand a change.

## AI Reviewer Comment Policy

The AI reviewer should post review comments as suggestions and observations.

It should not automatically submit `Request Changes`.

It should not automatically approve a PR.

It should not block merging by itself.

Humans decide whether a comment is actionable, whether the PR needs changes, and whether it can be merged.

Recommended severity labels:

- `blocking-risk`: likely bug, security issue, or clear architectural violation. Human reviewer decides whether to request changes.
- `follow-up`: important but can reasonably be handled in a later PR.
- `question`: needs human clarification.
- `nit`: small readability or documentation improvement.

## Review Output Shape

AI reviewer output should be concise and structured.

Recommended sections:

- Summary
- Findings
- Questions
- Follow-up Suggestions
- Verification Notes

Findings should include file paths and line numbers when possible. Broad architectural feedback should cite the relevant guideline or ADR.
