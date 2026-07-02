# @boardgame/ito-discord

Discord adapter for running and manually testing ITO from a Discord server during local development.

## Environment Variables

Set these values in your shell or a local `.env` before registering commands or starting the bot.

```env
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
```

- `DISCORD_BOT_TOKEN`
  Discord bot token used to log in the bot client.
- `DISCORD_CLIENT_ID`
  Discord application client id used when registering slash commands.
- `DISCORD_GUILD_ID`
  Discord server id used for guild command registration during local development.

Do not commit real secret values.

## Register Slash Commands

Run from the repository root:

```sh
pnpm --filter @boardgame/ito-discord register-commands
```

This registers the current `/ito` guild commands for the server identified by `DISCORD_GUILD_ID`.

## Start Bot

Run from the repository root:

```sh
pnpm --filter @boardgame/ito-discord start
```

When startup succeeds, the bot logs in and waits for Discord interactions.

## Basic ITO Flow

Use the following commands in a Discord channel to manually test the current ITO flow:

```text
/ito create
/ito join
/ito join
/ito theme topic:"..."
/ito assign
/ito deliver
/ito discuss
/ito submit order:"user-1,user-2,user-3"
/ito reveal
```

Notes:

- `/ito join` should be run by each participating Discord user.
- `/ito submit` currently expects a comma-separated list of Discord user ids in the submitted order.
- `/ito reveal` judges the submitted order and shows the revealed numbers with success or failure.

## Utility Commands

These commands are useful while testing:

```text
/ito status
/ito help
/ito reset
/ito ping
```

- `/ito status`
  Shows the current game status summary for the channel.
- `/ito help`
  Shows the available ITO commands.
- `/ito reset`
  Removes the current channel game so the flow can be retried from scratch.
- `/ito ping`
  Confirms that the bot is running and responding.

## Scope

This README is only for local development and manual verification.

It does not describe:

- production deployment
- global slash command registration
- Docker setup
- Discord Developer Portal details
- long-term operations
