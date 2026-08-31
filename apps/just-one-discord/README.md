# Just One Discord Adapter

This adapter provides the current Just One v1 flow in Discord. It is intended
for local development and manual playtesting.

## Just One v1 Gameplay

### 1. Create And Join

Create a game in a public guild text channel, then have every player join it.

```text
/just-one create
/just-one join
```

At least two players must join before the game can start.

### 2. Start A Round

Start the first round with:

```text
/just-one start
```

The Engine chooses a Guesser and a secret word. The public channel shows the
round number and the Guesser. Each non-guesser receives a private hint thread.

### 3. Submit Hints

Each Hint Player opens their private thread, reads the secret word, and submits
one hint. A later message in the same thread replaces that player's hint while
hint submission remains open.

The public channel shows only the aggregate hint progress. It never shows hint
text or the secret word at this stage.

### 4. Review Duplicates

When all Hint Players have submitted, they receive one shared private duplicate
review thread. Hint Players use Remove and Restore controls to exclude duplicate
or unsuitable hints, then select Confirm hints.

The Guesser is not added to this thread.

### 5. Make A Guess

After duplicate review is confirmed, the public channel shows the remaining
hints and an Answer button. Only the Guesser can use the button. It opens a
modal where the Guesser submits an answer.

### 6. Reveal And Confirm The Result

After the answer is submitted, the public channel reveals the guess and the
secret word. Any game participant selects Correct or Incorrect to confirm the
round result. The adapter does not decide correctness automatically.

Select Score round to add the confirmed result to the team score.

### 7. Continue Through Round 13

For rounds 1 through 12, select Next round after scoring. The next Guesser is
chosen by rotating through players in join order. A new secret word is chosen,
round-local data is reset, and the total score is retained.

After scoring round 13, select Finish game. The game becomes finished and the
final score and Engine-derived evaluation are displayed.

### 8. Play Again

After a game is finished, a game participant can select Play again. The same
players and their join order are kept, while the score, round number, and
round-local state are reset. A new first round starts immediately.

## Public And Private Boundary

### Public Channel

The public channel can show:

- Game start and round number
- The Guesser
- Aggregate hint progress
- Remaining hints after duplicate review
- The Guesser's submitted guess, during reveal
- The secret word, only during reveal and later
- The confirmed result, round score, total score, and final evaluation

The secret word is never shown publicly during game start or hint collection.

### Private Threads

Before reveal, private threads contain:

- The secret word for each individual Hint Player
- That Hint Player's unconfirmed hint
- The shared duplicate-review hint list and its controls for Hint Players

The Guesser does not receive a private hint thread or access to the duplicate
review thread.

## Manual Smoke Test

Use at least two Discord users and a regular guild text channel.

- [ ] Run `/just-one create`.
- [ ] Have each player run `/just-one join`.
- [ ] Run `/just-one start` and confirm that the public message shows `Round: 1`.
- [ ] Confirm that the Guesser cannot see the secret word.
- [ ] Confirm that each Hint Player receives one private hint thread.
- [ ] Confirm that the secret word is not present in the public channel.
- [ ] Submit one hint from every private hint thread and confirm that only the aggregate progress changes publicly.
- [ ] Confirm that a shared duplicate-review thread is created for Hint Players, without the Guesser.
- [ ] Use Remove and Restore, then select Confirm hints.
- [ ] Confirm that only the remaining hints are displayed publicly.
- [ ] Confirm that only the Guesser can use Answer and submit a guess.
- [ ] Confirm that reveal displays both the guess and the secret word.
- [ ] Confirm the result with Correct or Incorrect, then select Score round.
- [ ] Start a next round and confirm that the Guesser rotates and the total score remains.
- [ ] Repeat until round 13, score it, and select Finish game.
- [ ] Confirm that the final score and evaluation are displayed.
- [ ] Select Play again and confirm that a new Round 1 starts with the same players.
- [ ] Confirm that a message in an old hint thread cannot submit a hint to the new game.

## Required Permissions

- View Channel
- Create Private Threads
- Send Messages in Threads
- Manage Threads
- Read Message History

## Required Gateway Intents

- Guilds
- GuildMessages
- MessageContent

## Current Limitations

- Private threads can only be created in regular guild text channels. Forum and media channels use different thread creation flows.
- Permission failures surface as Discord API errors during thread creation or member addition.
- Partial private-thread creation failures are reported publicly and are not rolled back in v1.
- The adapter does not retry or provide a recovery command after Discord resource creation or message update failures.
- Private threads are not archived or deleted automatically.
- Players cannot join or leave while a game is in progress.
- Round history is not retained after a round advances.
- Game sessions are in memory only and are lost when the bot restarts.
- Previously used secret words are not excluded from later rounds.
