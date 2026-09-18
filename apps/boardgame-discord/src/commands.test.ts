import { describe, expect, it } from "vitest";

import { getBoardgameDiscordCommandData } from "./commands.js";

describe("getBoardgameDiscordCommandData", () => {
  it("returns both game commands for one guild registration", () => {
    expect(getBoardgameDiscordCommandData().map((command) => command.name)).toEqual([
      "ito",
      "just-one"
    ]);
  });
});
