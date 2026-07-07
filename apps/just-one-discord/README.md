# Just One Discord Adapter

## Private Thread PoC

This app includes a proof of concept for Just One private hint threads.

Use the following command in a regular text channel:

```text
/just-one thread-poc player:@hint-player
```

You can optionally override the default secret word:

```text
/just-one thread-poc player:@hint-player word:Apple
```

The PoC checks the following:

- Private thread creation
- Member invitation
- Bot posting
- Receiving replies
- Thread identification

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

### Works

- Private Thread creation
- Member invitation
- Bot posting
- Receiving replies
- Thread identification

### Limitations

- Private threads can only be created in regular guild text channels
- Forum and media channels use different thread creation flows
- Permission failures surface as Discord API errors during thread creation or member add
- Reply capture depends on `GuildMessages` and `MessageContent` intents being enabled
- The PoC only logs and stores reply metadata; it does not save hints into the Engine
