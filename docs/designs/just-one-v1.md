# Just One v1

## Goal

- Discord only playable Just One
- MVP first
- Clear boundary between Engine and Discord adapter

## Core Game Flow

1. Create game
2. Players join
3. Start game
4. Randomly choose one guesser
5. Randomly choose one secret word
6. Non-guessers receive the secret word
7. Each non-guesser submits one hint
8. Duplicate hints are removed
9. Remaining hints are shown to the guesser
10. Guesser answers
11. Reveal result
12. Next round

## Discord UX

### Public Channel

- Create
- Join
- Start
- Guess result
- Reveal

### DM

- Secret word
- Personal role (Guesser / Hint player)

### Public Hint Thread

Players submit hints in a dedicated thread.

The thread is hidden from the guesser by game rule only, with players cooperating manually in v1.

## MVP Scope

### Include

- One round only
- Random guesser
- Random word
- Hint collection
- Duplicate removal
- Reveal
- Manual success / failure

### Exclude

- Score
- Multiple rounds
- Expansion packs
- Timer
- AI moderation
- Automatic winner judgement

## Engine Responsibilities

- Player management
- Round state
- Random guesser
- Random word
- Duplicate hint detection

## Discord Responsibilities

- DM delivery
- Thread creation
- Button interactions
- Hint collection
- Message formatting

## Future Ideas

- Multiple rounds
- Score board
- Word packs
- Timer
- Auto next round
