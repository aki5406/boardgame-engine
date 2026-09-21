# Boardgame Discord Bot

This is the shared Discord composition root for the currently supported games.
It creates one Discord Client, then registers the ITO and Just One adapters with
independent Engines and session registries.

## Environment Variables

```env
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
```

- `DISCORD_BOT_TOKEN`: Bot token for the shared Discord application.
- `DISCORD_CLIENT_ID`: Application ID used to register guild commands.
- `DISCORD_GUILD_ID`: Development guild ID used for command registration.

## Register Commands

Register all commands with one guild command update:

```bash
pnpm --filter @boardgame/boardgame-discord register-commands
```

## Start The Bot

```bash
pnpm --filter @boardgame/boardgame-discord start
```

The shared bot registers `/game`, `/ito`, and `/just-one` on the same Discord
Client.

## Game Launcher

Use `/game` to open an ephemeral game launcher. It currently lists ITO and Just
One. Selecting a game shows its description and the game-specific create and
join commands.

The launcher is guidance only: it does not create a game session. Start a game
with `/ito create` or `/just-one create`.

## Scope

This app composes existing adapters only. It does not define a shared game
session model, a policy for running multiple games in the same channel, or a
shared create and join flow.
