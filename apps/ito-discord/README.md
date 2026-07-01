# @boardgame/ito-discord

Discord Adapter app package for ITO.

This package is the future home for Discord-specific input, output, user mapping, and session handling around `@boardgame/game-ito`.

Current scope:

- Establish the app package location.
- Depend on `@boardgame/game-ito`.
- Read `DISCORD_BOT_TOKEN` from the environment.
- Create a Discord client and log in.
- Define the `/ito ping` slash command data.
- Reply to `/ito ping`.
- Keep an in-memory channel-to-session registry.
- Create an ITO session for a channel with `/ito create`.
- Join an existing channel session with `/ito join`.
- Keep Discord-specific code out of `@boardgame/engine` and `@boardgame/game-ito`.

Create a local `.env` or set the variable in your shell before starting the adapter:

```sh
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
```

Run from the repository root:

```sh
pnpm --filter @boardgame/ito-discord start
```

Register guild slash commands from the repository root:

```sh
pnpm --filter @boardgame/ito-discord register-commands
```

It intentionally does not include global slash command registration, ITO game flow, persistence, Docker, or deployment settings yet.
