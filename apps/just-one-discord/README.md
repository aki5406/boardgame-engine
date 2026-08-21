# Just One Discord Adapter

## Private Hint Threads

`/just-one start` creates one private thread for each Hint Player.

Each thread contains the secret word and the input instructions for that player only.

Public start and round-complete messages show the Engine-managed round number. The Discord adapter displays this value but does not calculate it.

After the Engine scores round 13, the round-complete message offers a Finish game control. Finishing updates that same message with the Engine-managed final score and removes its controls.

### Required Permissions

- View Channel
- Create Private Threads
- Send Messages in Threads
- Manage Threads
- Read Message History

### Required Gateway Intents

- Guilds
- GuildMessages
- MessageContent

### Limitations

- Private threads can only be created in regular guild text channels
- Forum and media channels use different thread creation flows
- Permission failures surface as Discord API errors during thread creation or member add
- Partial thread creation failures are reported publicly and are not rolled back in v1
