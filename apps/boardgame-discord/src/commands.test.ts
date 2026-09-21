import { describe, expect, it } from "vitest";

import { registerBoardgameDiscordCommands } from "./command-registration.js";
import { getBoardgameDiscordCommandData } from "./commands.js";

describe("getBoardgameDiscordCommandData", () => {
  it("returns all game commands for one guild registration", () => {
    expect(getBoardgameDiscordCommandData().map((command) => command.name)).toEqual([
      "game",
      "ito",
      "just-one"
    ]);
  });

  it("registers both commands in one guild command PUT", async () => {
    const calls: Array<{
      readonly route: string;
      readonly body: ReturnType<typeof getBoardgameDiscordCommandData>;
    }> = [];

    await registerBoardgameDiscordCommands({
      config: {
        discordBotToken: "token",
        discordClientId: "client-id",
        discordGuildId: "guild-id"
      },
      rest: {
        put: async (route, options) => {
          calls.push({ route, body: options.body });
        }
      }
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.body.map((command) => command.name)).toEqual(["game", "ito", "just-one"]);
  });
});
