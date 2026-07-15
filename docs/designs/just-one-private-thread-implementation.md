# Just One Private Thread Implementation

## Goal

- Replace the PoC with a production implementation
- Make the relationship between threads and sessions explicit
- Preserve the responsibility boundary between Engine and Discord Adapter

## Flow

1. Game starts
2. Guesser is selected
3. Secret Word is selected
4. Create one private thread for each Hint Player
5. Store thread ownership
6. Bot posts the Secret Word
7. Hint Player replies
8. `messageCreate` resolves the session from `threadId`
9. Engine receives a `hintSubmitted` event
10. Public progress is updated

## Thread Registry

Discord Adapter manages the relationship between threads and sessions.

Example

```text
threadId
    to
sessionId
playerId
channelId
```

The Engine should not know about Discord thread IDs.

## Engine Responsibilities

- Accept submitted hints
- Validate game phase
- Track submitted players
- Determine when all hints are collected

## Discord Adapter Responsibilities

- Create private threads
- Map `threadId` to `session` and `player`
- Listen for `messageCreate`
- Forward `hintSubmitted` events
- Update progress messages

## Public Channel

Only progress is shown.

Example

```text
Hint progress

3 / 5 players submitted
```

Secret words and hint contents must never be shown publicly.

## Migration from PoC

- Remove `/just-one thread-poc`
- Remove PoC registry
- Reuse the verified thread creation logic
- Move the implementation into the normal Start flow

## Future Work

- Hint editing
- Thread cleanup
- Thread archive
- Retry on creation failure
