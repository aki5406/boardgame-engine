# @boardgame/game-ito

`@boardgame/game-ito` is the future ITO game package for boardgame-engine.

This package will contain ITO-specific rules and state transitions on top of `@boardgame/engine`.

## Role

- Keep ITO-specific concepts out of `@boardgame/engine`.
- Provide ITO-specific events, state, reducer, and game definition.
- Validate the Engine API through a real game implementation over time.

## Current Scope

This package currently contains the minimal ITO event, state, reducer, and game definition needed to connect with the Engine.

The current public API exports:

- `ItoEvent`: the union of ITO-specific events that can drive future state transitions.
- `ItoThemeSelectedEvent`: records the selected theme text for a round.
- `ItoNumbersAssignedEvent`: records which hidden number was assigned to each player.
- `ItoDiscussionStartedEvent`: records that the round has entered the discussion phase.
- `ItoHintSubmittedEvent`: records a player's hint for the selected theme.
- `ItoOrderSubmissionStartedEvent`: records that the round has entered the order submission phase.
- `ItoRevealOrderSubmittedEvent`: records the reveal order chosen by the group.
- `ItoResultRevealedEvent`: records the revealed round result.
- `ItoNumberAssignment`: the player-to-number pair used by `ItoNumbersAssignedEvent`.
- `ItoState`: the minimal ITO-specific state shape.
- `ItoPhase`: the current ITO flow phase.
- `ItoPlayer`: the ITO state player identity.
- `ItoAssignedNumber`: the player-to-number pair stored in state.
- `ItoHint`: a player hint stored in state.
- `ItoResult`: the revealed result stored in state.
- `ItoReducer`: the ITO-specific reducer shape.
- `reduceItoState`: applies an `ItoEvent` to an `ItoState`.
- `itoReducer`: the reducer exposed through the Engine reducer shape.
- `itoInitialState`: the minimal initial state for an ITO session.
- `itoGame`: the ITO game definition for the Engine.
- `createItoEngine`: creates an Engine configured with `itoGame`.
- `judgeItoRevealOrder`: creates a result event by checking whether the submitted order is ascending by assigned number.

`ItoEvent` is built on top of `EngineEvent`. Each ITO event keeps the engine-level `type` field and narrows it to an ITO-specific event name.

`ItoState` is built on top of `EngineState`. It keeps the engine-level readonly state shape and adds the minimal ITO-specific fields needed to describe the current game progress.

`itoReducer` connects `ItoEvent` and `ItoState` through the Engine reducer shape. It only records event payloads into state and advances the phase; it does not generate numbers, judge results, or validate full game rules.

`itoGame` connects the ITO reducer to the Engine `Game` API. `itoInitialState` is exported separately because the current Engine game metadata only contains the game id and reducer.

## Minimal Play Flow

The current one-round flow is represented by applying these events through the Engine:

1. `ito.themeSelected`
2. `ito.numbersAssigned`
3. `ito.discussionStarted`
4. `ito.hintSubmitted`
5. `ito.orderSubmissionStarted`
6. `ito.revealOrderSubmitted`
7. `ito.resultRevealed`

The reducer records each event payload into state and advances `phase`. Number generation is still outside this package scope. Result judging is represented by `judgeItoRevealOrder`, which returns `success: true` when the submitted player order maps to ascending assigned numbers.

## Discussion Phase

Discussion is represented as game progress with the `discussion` phase. `ito.discussionStarted` moves the state into that phase after theme selection and number assignment are ready.

The reducer does not model chat messages, voice state, timers, or AI conversation. `ito.hintSubmitted` records player hints while keeping the state in `discussion`; `ito.orderSubmissionStarted` moves the game out of discussion and into order submission.

## Order Submission Phase

Order submission is represented as game progress with the `orderSubmission` phase. `ito.orderSubmissionStarted` marks that discussion has ended and the group is entering the reveal order.

`ito.revealOrderSubmitted` remains the event for the submitted order itself. This keeps "start entering the order" separate from "submit the chosen order" without adding UI, CLI, or validation behavior.

## Theme Selection

Themes are selected explicitly with `ito.themeSelected`. The reducer stores the event payload in `state.theme` and moves the phase to `themeSelected`.

Theme random generation and theme list management are intentionally outside the reducer. They can be added later around event creation without changing the reducer contract.

## Number Assignment

Numbers are assigned explicitly with `ito.numbersAssigned`. The reducer stores the event payload in `state.assignedNumbers` and moves the phase to `numbersAssigned`.

Random generation, shuffling, and private delivery are intentionally outside the reducer. They can be added later around event creation without changing the reducer contract.

It intentionally does not include:

- Theme random generation
- Theme list management
- Card
- Player management
- Number distribution
- CLI integration
- Discord integration
