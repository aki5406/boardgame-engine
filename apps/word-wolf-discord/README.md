# Word Wolf Discord Adapter

This standalone adapter supports the first Word Wolf flow: create a game, join
players, start the game, and deliver one private word thread to every player.

## Environment Variables

```env
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
```

- `DISCORD_BOT_TOKEN`: Discord bot token used to log in and register commands.
- `DISCORD_CLIENT_ID`: Discord application ID for guild command registration.
- `DISCORD_GUILD_ID`: Development guild ID for guild command registration.

## Register Commands

```text
pnpm --filter @boardgame/word-wolf-discord register-commands
```

## Start The Bot

```text
pnpm --filter @boardgame/word-wolf-discord start
```

## Manual Flow

Use a regular guild text channel and at least three Discord users.

```text
/word-wolf create
/word-wolf join
/word-wolf join
/word-wolf join
/word-wolf start
```

After start, each player receives a private thread containing only that
player's assigned word. The public channel only announces that discussion has
started; it does not reveal words, roles, or the Minority Player.

## Required Permissions

- View Channel
- Create Private Threads
- Send Messages in Threads
- Manage Threads
- Read Message History
