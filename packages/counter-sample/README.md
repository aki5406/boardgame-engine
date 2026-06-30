# @boardgame/counter-sample

`@boardgame/counter-sample` is a minimal sample game for checking how the engine API feels from a game package.

It is not intended to be a real game implementation.

## Sample Flow

The sample verifies this minimal state transition:

```ts
initial state: { count: 0 }
event: { type: "increment" }
next state: { count: 1 }
```

## Scope

This package intentionally does not include CLI, Discord, Web, lobby, player management, win conditions, turns, persistence, or complex rules.
