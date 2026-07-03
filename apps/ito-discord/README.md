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

To capture answer text posted in the public answers thread, enable Message Content Intent for the bot in the Discord Developer Portal as well.

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
/ito status
/ito submit order:"user-1,user-2,user-3"
/ito reveal
```

Notes:

- `/ito join` should be run by each participating Discord user.
- Use `/ito status` to check Player IDs before `/ito submit`.
- `/ito submit` currently expects a comma-separated list of Discord user ids in the submitted order.
- `/ito reveal` judges the submitted order and shows the revealed numbers with success or failure.

## ITO v1 Gameplay

1. Create a game.
2. Players join.
3. Press Start.
4. Enter a theme.
5. Press Assign & Deliver.
6. Each player receives a number via DM.
7. Each player posts an answer in the public answers thread.
8. Wait until everyone has answered.
9. Press Start Discussion.
10. Discuss without revealing your numbers.
11. Press Reveal Result.
12. Compare numbers and answers together.

### Current Behavior

- Numbers are delivered via DM.
- Answers are posted in a public answers thread.
- Answer progress is shown in the status message.
- A Start Discussion button appears when everyone has answered.
- Reveal shows both numbers and answers.
- Success / failure is judged by the players.

## Submit UX Notes

The current `/ito submit` flow works for manual testing, but entering player ids by hand is still a rough Discord experience.

The following options are the current candidates for improving submit UX in future PRs.

### Option 1: Keep Slash Command

- Pros:
  - simplest implementation
  - fully compatible with the current flow
  - easy to keep testing from text examples in `/ito status`
- Cons:
  - player id input is still cumbersome
  - easy to make ordering or typing mistakes

### Option 2: Modal

- Pros:
  - can open a Discord input form in place
  - fits the current comma-separated order format fairly well
  - smaller change than introducing a fully guided flow
- Cons:
  - still not a true reorder UI
  - users still need to copy or type ids manually

### Option 3: Select Menu

- Pros:
  - lets users choose player ids instead of typing them
  - reduces input mistakes
  - feels more Discord-native than raw text entry
- Cons:
  - ordering is not naturally expressed by a single select menu
  - may require multiple steps or extra conventions

### Option 4: Button-based Step Submission

- Pros:
  - could let players build the submitted order one player at a time
  - seems like a good fit for ITO's reveal-order workflow
  - can reduce raw text input significantly
- Cons:
  - session-side state handling becomes more complex
  - partial submission and correction flows need careful design

For now, the project keeps the Slash Command approach and treats these options as design notes rather than a fixed implementation plan.

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
