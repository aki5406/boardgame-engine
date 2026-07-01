# @boardgame/ito-discord

Discord Adapter app package for ITO.

This package is the future home for Discord-specific input, output, user mapping, and session handling around `@boardgame/game-ito`.

Current scope:

- Establish the app package location.
- Depend on `@boardgame/game-ito`.
- Keep Discord-specific code out of `@boardgame/engine` and `@boardgame/game-ito`.

It intentionally does not include `discord.js`, bot startup, slash command registration, token management, `.env`, Discord API calls, persistence, Docker, or deployment settings yet.
