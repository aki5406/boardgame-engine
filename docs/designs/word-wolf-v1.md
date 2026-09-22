# Word Wolf v1

## Goal

- Define the first Word Wolf game flow before implementation begins.
- Keep game rules and state transitions in a client-independent Engine package.
- Keep Discord input, private delivery, and presentation in a Discord adapter.
- Establish an MVP that can be implemented through small pull requests.

## Core Game Flow

1. Create a game.
2. Players join the game.
3. Start the game with at least three players.
4. The Engine selects one Minority Player and a word pair.
5. Each player receives only their assigned word in a private thread.
6. Players discuss in the public channel without stating their word directly.
7. A participant starts voting.
8. Each player votes for one other player.
9. When every player has voted, reveal the words, roles, votes, and result.
10. Finish the game.

The v1 phase model is:

```text
waiting -> discussion -> voting -> revealed -> finished
```

## Rules

### Players

- At least three players are required to start.
- v1 has no upper player limit.
- Joining and leaving are allowed only in the `waiting` phase.

### Roles And Words

- There is exactly one Minority Player.
- All other players are Majority Players.
- The Minority Player and the word pair are selected using injected randomness.
- The Engine must not call `Math.random` directly.
- A word pair supplies one Majority word and one Minority word.
- v1 can use a small in-code default word-pair list.

### Discussion

- Discussion takes place in the public Discord channel.
- The adapter posts an instruction to discuss the assigned words without naming them.
- v1 has no discussion timer and no host role.

### Voting

- Any participant can move the game from discussion to voting.
- Each participant votes once for one other participant.
- Self-votes are invalid.
- Vote changes are not allowed in v1.
- Individual votes remain private until reveal.
- The public channel shows only aggregate vote progress before reveal.

### Result

- The suspected player is the single player with the most votes.
- If multiple players are tied for the most votes, the result is a draw.
- Majority wins when the suspected player is the Minority Player.
- Minority wins when the suspected player is not the Minority Player or the result is a draw.
- v1 does not include the Minority Player's word-guess reversal rule.

## State And Engine Responsibilities

The future `@boardgame/game-word-wolf` package owns the game state and rules.
The exact type names can be refined during implementation, but the state needs to
represent at least:

```ts
type WordWolfPhase = "waiting" | "discussion" | "voting" | "revealed" | "finished";

interface WordWolfState {
  phase: WordWolfPhase;
  players: readonly PlayerId[];
  majorityPlayerIds: readonly PlayerId[];
  minorityPlayerId: PlayerId | null;
  majorityWord: string | null;
  minorityWord: string | null;
  votesByPlayerId: Readonly<Record<PlayerId, PlayerId>>;
}
```

The Engine is responsible for:

- Create, join, and start validation.
- Minority Player and word-pair selection from injected randomness.
- Phase transitions from discussion to voting and voting to reveal readiness.
- Vote validation, including participant, self-vote, and duplicate-vote checks.
- Vote progress, suspected-player calculation, tie detection, and winner calculation.

The Engine must not contain Discord IDs, thread IDs, Discord API calls, message
formatting, or private delivery logic.

## Discord Adapter Responsibilities

The future `apps/word-wolf-discord` adapter is responsible for:

- Slash commands, buttons, and select menus.
- Creating one private word-delivery thread for each player.
- Delivering each player's assigned word privately.
- Showing discussion and voting progress in the public channel.
- Rendering the Engine-derived reveal and result.
- Managing Discord thread and message identifiers outside Engine state.

The adapter translates Discord interactions into Engine events and renders Engine
state. It does not decide roles, validate game rules, tally votes, or decide the
winner.

## Public And Private Boundary

### Public Before Reveal

The public channel may show:

- Game creation and joined-player status.
- Game start and discussion instructions.
- Voting start and aggregate vote progress.

The public channel must not show:

- Majority or Minority words.
- The Minority Player.
- Player roles.
- Individual votes.

### Private Before Reveal

Each player can see only their own assigned word in a private thread. The voting
interaction and any personal vote confirmation are also private.

### Public After Reveal

The public channel shows:

- Majority and Minority words.
- The Minority Player.
- Each player's vote.
- The suspected player or draw.
- The winning side.

Secret words, roles, and votes must not be written to public error messages or
logs before reveal.

## Discord UX

The intended v1 flow is:

```text
/word-wolf create
-> game created

/word-wolf join
-> players join

/word-wolf start
-> private word delivery and public discussion guidance

[Start voting]
-> public voting guidance and player select menu

all votes submitted
-> [Reveal]
-> words, roles, votes, and winner
```

Voting uses a public message with a player select menu. The selection itself is
handled privately or ephemerally, and the public message reports only progress
until reveal.

## Package And App Direction

The planned layout is:

```text
packages/
  game-word-wolf

apps/
  word-wolf-discord
  boardgame-discord
```

`word-wolf-discord` may depend on `game-word-wolf`; `game-word-wolf` must not
depend on Discord apps. A later integration adds the command and adapter to the
shared `boardgame-discord` composition root and the `/game` catalog.

## Implementation Plan

1. Add `game-word-wolf` state, phases, and create/join/start foundations.
2. Add injected-random Minority Player and word-pair assignment.
3. Add the Discord adapter create/join/start flow and private word delivery.
4. Add discussion-to-voting transition and vote submission.
5. Add reveal, tally, tie handling, and winner calculation.
6. Compose the adapter into the shared bot and add it to the game launcher.
7. Add README instructions and a manual smoke test.

## v1 Out Of Scope

- Discussion timer.
- Host role.
- Re-voting or vote changes.
- Multiple Minority Players.
- Minority word-guess reversal rules.
- Spectators and mid-game joins or leaves.
- Score, rematch, history, and persistence.
- Custom word-pair management or external storage.
- Localization framework, Web UI, or AI moderation.

## Decisions

- Word Wolf is the third planned game.
- v1 has one Minority Player and at least three players.
- Each player receives a word in a private thread.
- Discussion occurs in the public channel without a timer.
- Voting is one private, immutable, non-self vote per participant.
- A tied highest vote is a Minority win.
- Winner calculation belongs to the Engine.

## Deferred Decisions

- Timer behavior and host permissions.
- Re-vote and vote-change rules.
- Multiple Minority Players and reversal rules.
- Rematch, persistence, score, history, and custom word pairs.
