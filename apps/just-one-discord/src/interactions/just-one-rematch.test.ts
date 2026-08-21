import { ChannelType } from "discord.js";
import { describe, expect, it, vi } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import {
  handleJustOnePlayAgainButton,
  type RegisterJustOneInteractionHandlersInput
} from "./just-one.js";
import { createJustOneDiscordSessionRegistry } from "../session/registry.js";
import { getJustOneState } from "../session/state.js";

describe("handleJustOnePlayAgainButton", () => {
  it("starts round one again for the same players and clears prior round resources", async () => {
    const { input, registry, channel, privateThread } = createTestContext();
    const interaction = createInteraction({ channel });

    await handleJustOnePlayAgainButton(interaction as never, input);

    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({
      phase: "hinting",
      players: ["player-1", "player-2"],
      score: 0,
      roundNumber: 1,
      guesserId: "player-1",
      secretWord: "Apple"
    });
    expect(registry.getHintThread("old-hint-thread")).toBeUndefined();
    expect(registry.getHintProgressMessage("channel-1")?.messageId).toBe("public-message-2");
    expect(registry.getRevealMessage("channel-1")).toBeUndefined();
    expect(channel.threads.create).toHaveBeenCalledTimes(1);
    expect(privateThread.send).toHaveBeenCalledWith(expect.stringContaining("Secret Word:\nApple"));
    expect(channel.send.mock.calls.map(([message]) => message).join("\n")).not.toContain("Apple");
    expect(interaction.editReply).toHaveBeenCalledWith({ components: [] });
  });

  it.each([
    ["player-3", false, "reveal-message", "Only game participants can start a rematch."],
    ["player-2", true, "reveal-message", "Only game participants can start a rematch."],
    ["player-2", false, "stale-message", "This rematch has already started."]
  ])(
    "rejects non-participants, bots, and stale interactions",
    async (userId, bot, messageId, content) => {
      const { input, registry, channel } = createTestContext();
      const interaction = createInteraction({ channel, userId, bot, messageId });

      await handleJustOnePlayAgainButton(interaction as never, input);

      expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({ phase: "finished" });
      expect(interaction.deferUpdate).not.toHaveBeenCalled();
      expect(channel.threads.create).not.toHaveBeenCalled();
      expect(interaction.reply).toHaveBeenCalledWith({ content, ephemeral: true });
    }
  );

  it("does not start a second rematch from the old finished message", async () => {
    const { input, registry, channel } = createTestContext();
    const interaction = createInteraction({ channel });

    await handleJustOnePlayAgainButton(interaction as never, input);
    await handleJustOnePlayAgainButton(interaction as never, input);

    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({ phase: "hinting" });
    expect(channel.threads.create).toHaveBeenCalledTimes(1);
    expect(interaction.reply).toHaveBeenCalledWith({
      content: "This rematch has already started.",
      ephemeral: true
    });
  });

  it("keeps the started Engine state when private thread creation fails", async () => {
    const { input, registry, channel } = createTestContext({
      privateThreadError: new Error("Denied")
    });
    const interaction = createInteraction({ channel });

    await handleJustOnePlayAgainButton(interaction as never, input);

    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({
      phase: "hinting",
      score: 0,
      roundNumber: 1
    });
    expect(channel.send.mock.calls.map(([message]) => message).join("\n")).not.toContain("Apple");
  });
});

function createTestContext(input: { readonly privateThreadError?: Error } = {}): {
  readonly input: RegisterJustOneInteractionHandlersInput;
  readonly registry: ReturnType<typeof createJustOneDiscordSessionRegistry>;
  readonly channel: ReturnType<typeof createChannel>;
  readonly privateThread: ReturnType<typeof createPrivateThread>;
} {
  const engine = createJustOneEngine();
  const registry = createJustOneDiscordSessionRegistry();
  const session = engine.startSession({
    id: "just-one:channel-1",
    players: [{ id: "player-1" }, { id: "player-2" }],
    initialState: {
      phase: "finished",
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
  registry.registerHintThread({
    threadId: "old-hint-thread",
    sessionId: session.id,
    channelId: "channel-1",
    playerId: "player-2"
  });
  registry.registerHintProgressMessage({
    channelId: "channel-1",
    sessionId: session.id,
    messageId: "old-progress-message"
  });
  registry.registerDuplicateReviewThread({
    threadId: "old-review-thread",
    sessionId: session.id,
    channelId: "channel-1",
    messageId: "old-review-message"
  });
  registry.registerGuessingMessage({
    channelId: "channel-1",
    sessionId: session.id,
    messageId: "old-guessing-message"
  });
  registry.registerRevealMessage({
    channelId: "channel-1",
    sessionId: session.id,
    messageId: "reveal-message"
  });

  const privateThread = createPrivateThread();
  const channel = createChannel({
    privateThread,
    ...(input.privateThreadError ? { privateThreadError: input.privateThreadError } : {})
  });

  return {
    input: { engine, sessionRegistry: registry, random: () => 0 },
    registry,
    channel,
    privateThread
  };
}

function createPrivateThread() {
  return {
    id: "new-hint-thread",
    members: { add: vi.fn().mockResolvedValue(undefined) },
    send: vi.fn().mockResolvedValue(undefined)
  };
}

function createChannel(input: {
  readonly privateThread: ReturnType<typeof createPrivateThread>;
  readonly privateThreadError?: Error;
}) {
  let publicMessageCount = 0;

  return {
    type: ChannelType.GuildText,
    threads: {
      create: input.privateThreadError
        ? vi.fn().mockRejectedValue(input.privateThreadError)
        : vi.fn().mockResolvedValue(input.privateThread)
    },
    send: vi.fn().mockImplementation(async () => {
      publicMessageCount += 1;
      return { id: `public-message-${publicMessageCount}` };
    })
  };
}

function createInteraction(input: {
  readonly channel: ReturnType<typeof createChannel>;
  readonly userId?: string;
  readonly bot?: boolean;
  readonly messageId?: string;
}) {
  return {
    channelId: "channel-1",
    channel: input.channel,
    message: { id: input.messageId ?? "reveal-message" },
    user: { id: input.userId ?? "player-2", bot: input.bot ?? false },
    reply: vi.fn().mockResolvedValue(undefined),
    deferUpdate: vi.fn().mockResolvedValue(undefined),
    editReply: vi.fn().mockResolvedValue(undefined),
    followUp: vi.fn().mockResolvedValue(undefined)
  };
}
