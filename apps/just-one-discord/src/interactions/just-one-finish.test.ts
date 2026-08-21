import { describe, expect, it, vi } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import {
  handleJustOneFinishGameButton,
  type RegisterJustOneInteractionHandlersInput
} from "./just-one.js";
import { createJustOneDiscordSessionRegistry } from "../session/registry.js";
import { getJustOneState } from "../session/state.js";

describe("handleJustOneFinishGameButton", () => {
  it("lets a participant finish the final round and updates the reveal message", async () => {
    const { input, registry } = createTestContext();
    const interaction = createInteraction({ userId: "player-2" });

    await handleJustOneFinishGameButton(interaction as never, input);

    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({
      phase: "finished",
      score: 9,
      roundNumber: 13
    });
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("Game finished"),
        components: expect.any(Array)
      })
    );
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("Evaluation: Wow, not bad at all!")
      })
    );
  });

  it.each([
    ["player-3", false],
    ["player-2", true]
  ])("rejects non-participants and bots", async (userId, bot) => {
    const { input, registry } = createTestContext();
    const interaction = createInteraction({ userId, bot });

    await handleJustOneFinishGameButton(interaction as never, input);

    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({ phase: "roundScored" });
    expect(interaction.reply).toHaveBeenCalledWith({
      content: "Only game participants can finish the game.",
      ephemeral: true
    });
    expect(interaction.update).not.toHaveBeenCalled();
  });

  it("rejects a stale reveal interaction", async () => {
    const { input, registry } = createTestContext();
    const interaction = createInteraction({ messageId: "stale-message" });

    await handleJustOneFinishGameButton(interaction as never, input);

    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({ phase: "roundScored" });
    expect(interaction.reply).toHaveBeenCalledWith({
      content: "This game has already finished.",
      ephemeral: true
    });
  });

  it("keeps the finished Engine state when Discord message updating fails", async () => {
    const { input, registry } = createTestContext();
    const interaction = createInteraction({ updateError: new Error("Discord unavailable") });
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await handleJustOneFinishGameButton(interaction as never, input);

    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({ phase: "finished" });
    expect(error).toHaveBeenCalledWith("Failed to update Just One finished game message.");
    expect(interaction.reply).toHaveBeenCalledWith({
      content: "The game finished, but the result message could not be refreshed.",
      ephemeral: true
    });
    error.mockRestore();
  });
});

function createTestContext(): {
  readonly input: RegisterJustOneInteractionHandlersInput;
  readonly registry: ReturnType<typeof createJustOneDiscordSessionRegistry>;
} {
  const engine = createJustOneEngine();
  const registry = createJustOneDiscordSessionRegistry();
  const session = engine.startSession({
    id: "just-one:channel-1",
    players: [{ id: "player-1" }, { id: "player-2" }],
    initialState: {
      phase: "roundScored",
      players: ["player-1", "player-2"],
      guesserId: "player-1",
      secretWord: "Apple",
      guess: "Apple",
      result: "correct",
      score: 9,
      roundNumber: 13,
      hintsByPlayerId: { "player-2": "Fruit" },
      excludedHintPlayerIds: []
    }
  });
  registry.register({ channelId: "channel-1", session });
  registry.registerRevealMessage({
    channelId: "channel-1",
    sessionId: session.id,
    messageId: "reveal-message"
  });

  return {
    input: { engine, sessionRegistry: registry, random: () => 0 },
    registry
  };
}

function createInteraction(input: {
  readonly userId?: string;
  readonly bot?: boolean;
  readonly messageId?: string;
  readonly updateError?: Error;
}) {
  const update = input.updateError
    ? vi.fn().mockRejectedValue(input.updateError)
    : vi.fn().mockResolvedValue(undefined);

  return {
    channelId: "channel-1",
    message: { id: input.messageId ?? "reveal-message" },
    user: { id: input.userId ?? "player-1", bot: input.bot ?? false },
    replied: false,
    deferred: false,
    reply: vi.fn().mockResolvedValue(undefined),
    update
  };
}
