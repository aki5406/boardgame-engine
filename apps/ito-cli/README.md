# @boardgame/ito-cli

Minimal CLI playground for trying the ITO game flow by hand.

This package is an adapter around `@boardgame/game-ito`. It keeps fixed player ids, theme text, assigned numbers, and submitted order in code, applies the ITO events through the Engine, and prints the final state.

Run it from the repository root:

```sh
pnpm ito:playground
```

It intentionally does not include interactive input, random generation, Discord integration, persistence, multiple rounds, or publish settings.
