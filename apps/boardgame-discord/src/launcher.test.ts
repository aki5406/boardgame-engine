import { Events } from "discord.js";
import { describe, expect, it, vi } from "vitest";

import { createBoardgameDiscordClient } from "./client.js";
import {
  BOARDGAME_GAME_SELECT_CUSTOM_ID,
  createBoardgameDetailsReply,
  createBoardgameLauncherReply,
  registerBoardgameLauncherInteractionHandlers
} from "./launcher.js";

describe("createBoardgameLauncherReply", () => {
  it("creates an ephemeral select menu for ITO and Just One", () => {
    const reply = createBoardgameLauncherReply();
    const menu = reply.components[0]?.components[0]?.toJSON();

    expect(reply.ephemeral).toBe(true);
    expect(menu).toMatchObject({
      custom_id: BOARDGAME_GAME_SELECT_CUSTOM_ID,
      options: [
        expect.objectContaining({ label: "ITO", value: "ito" }),
        expect.objectContaining({ label: "Just One", value: "just-one" })
      ]
    });
  });
});

describe("createBoardgameDetailsReply", () => {
  it("shows ITO commands after selection", () => {
    expect(createBoardgameDetailsReply("ito").content).toContain("/ito create");
    expect(createBoardgameDetailsReply("ito").content).toContain("/ito join");
  });

  it("shows Just One commands after selection", () => {
    expect(createBoardgameDetailsReply("just-one").content).toContain("/just-one create");
    expect(createBoardgameDetailsReply("just-one").content).toContain("/just-one join");
  });

  it("safely rejects an unknown game", () => {
    expect(createBoardgameDetailsReply("unknown").content).toBe(
      "This game is no longer available."
    );
  });
});

describe("registerBoardgameLauncherInteractionHandlers", () => {
  it("updates the ephemeral launcher with ITO details after selection", async () => {
    const client = createBoardgameDiscordClient();
    registerBoardgameLauncherInteractionHandlers(client);
    const interaction = createSelectInteraction("ito");

    client.emit(Events.InteractionCreate, interaction as never);
    await flushAsyncHandlers();

    expect(interaction.update).toHaveBeenCalledOnce();
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining("/ito create") })
    );

    client.destroy();
  });

  it("updates the ephemeral launcher with Just One details after selection", async () => {
    const client = createBoardgameDiscordClient();
    registerBoardgameLauncherInteractionHandlers(client);
    const interaction = createSelectInteraction("just-one");

    client.emit(Events.InteractionCreate, interaction as never);
    await flushAsyncHandlers();

    expect(interaction.update).toHaveBeenCalledOnce();
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining("/just-one create") })
    );

    client.destroy();
  });

  it("safely rejects a stale game selection", async () => {
    const client = createBoardgameDiscordClient();
    registerBoardgameLauncherInteractionHandlers(client);
    const interaction = createSelectInteraction("unknown");

    client.emit(Events.InteractionCreate, interaction as never);
    await flushAsyncHandlers();

    expect(interaction.update).toHaveBeenCalledWith({
      content: "This game is no longer available.",
      components: []
    });

    client.destroy();
  });
});

function createSelectInteraction(gameId: string) {
  return {
    customId: BOARDGAME_GAME_SELECT_CUSTOM_ID,
    values: [gameId],
    isChatInputCommand: () => false,
    isStringSelectMenu: () => true,
    update: vi.fn().mockResolvedValue(undefined)
  };
}

async function flushAsyncHandlers(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
}
