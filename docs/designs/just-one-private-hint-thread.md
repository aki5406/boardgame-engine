# Just One Private Hint Thread

## Goal

- Prevent players from seeing each other's hints before submission
- Provide a Discord UX that is easy to use during play
- Make the hint submission path explicit

## Flow

1. Game starts
2. Guesser is selected
3. Secret Word is selected
4. Each Hint Player gets a private thread
5. Bot posts the Secret Word in the thread
6. Hint Player submits one hint
7. Bot records the hint
8. When everyone has submitted:
   - Duplicate hints are removed
   - Remaining hints are shown to the Guesser

## Thread Ownership

Each Hint Player has exactly one private thread.

Example

Player A
- Private Thread

Player B
- Private Thread

Player C
- Private Thread

The Guesser does not receive a hint thread.

## Thread Content

Bot creates the thread with a message such as:

```text
Secret Word:
Apple

Reply with exactly one hint.
Do not use the secret word itself.
```

The Hint Player replies in that thread.

## Responsibilities

### Engine

- Store submitted hints
- Track submitted players
- Detect duplicate hints

### Discord Adapter

- Create private threads
- Invite the corresponding player
- Post the secret word
- Listen for replies
- Forward submitted hints to the Engine

## Public Channel

The public channel should only show progress.

Example:

```text
Hint progress

2 / 4 players submitted
```

No secret words or hints are shown publicly.

## Future Considerations

- Allow editing a hint before everyone has submitted
- Thread auto archive policy
- Handling players who cannot access private threads
- Recovery if thread creation fails
