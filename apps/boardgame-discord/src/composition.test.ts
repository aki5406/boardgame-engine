import { Events } from "discord.js";
import { describe, expect, it } from "vitest";

import { createBoardgameDiscordClient } from "./client.js";
import { registerBoardgameDiscordAdapters } from "./composition.js";

describe("registerBoardgameDiscordAdapters", () => {
  it("registers independent game adapters on one client", () => {
    const client = createBoardgameDiscordClient();
    const adapters = registerBoardgameDiscordAdapters(client);

    expect(client.listenerCount(Events.InteractionCreate)).toBe(2);
    expect(client.listenerCount(Events.MessageCreate)).toBe(2);
    expect(adapters.ito.engine).not.toBe(adapters.justOne.engine);
    expect(adapters.ito.sessionRegistry).not.toBe(adapters.justOne.sessionRegistry);

    client.destroy();
  });
});
