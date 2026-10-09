import { describe, expect, it } from "vitest";

import { createWordWolfEngine, type WordWolfState } from "@boardgame/game-word-wolf";

import { createWordWolfDiscordSessionForChannel } from "./create.js";
import { joinWordWolfDiscordSessionForChannel } from "./join.js";
import { createWordWolfDiscordSessionRegistry } from "./registry.js";
import { startWordWolfDiscordSession } from "./start.js";
import { startWordWolfVoting } from "./start-voting.js";
import { submitWordWolfVote } from "./vote.js";

describe("submitWordWolfVote", () => {
  it("updates the registry with the engine-owned vote", () => {
    const { engine, registry } = createVotingSession();

    const result = submitWordWolfVote({
      channelId: "channel-1",
      voterPlayerId: "user-1",
      targetPlayerId: "user-2",
      engine,
      registry
    });

    expect(result.status).toBe("submitted");
    expect((registry.get("channel-1")?.state as WordWolfState).votesByPlayerId).toEqual({
      "user-1": "user-2"
    });
  });

  it("reports a missing session without creating adapter vote state", () => {
    const engine = createWordWolfEngine();
    const registry = createWordWolfDiscordSessionRegistry();

    expect(
      submitWordWolfVote({
        channelId: "missing-channel",
        voterPlayerId: "user-1",
        targetPlayerId: "user-2",
        engine,
        registry
      })
    ).toEqual({ status: "notFound" });
  });
});

function createVotingSession() {
  const engine = createWordWolfEngine();
  const registry = createWordWolfDiscordSessionRegistry();
  createWordWolfDiscordSessionForChannel({ channelId: "channel-1", engine, registry });

  for (const playerId of ["user-1", "user-2", "user-3"]) {
    joinWordWolfDiscordSessionForChannel({
      channelId: "channel-1",
      playerId,
      engine,
      registry
    });
  }

  const started = startWordWolfDiscordSession({
    channelId: "channel-1",
    engine,
    registry,
    random: () => 0,
    wordPairs: [{ words: ["Coffee", "Tea"] }]
  });

  if (started.status !== "started") {
    throw new Error("Expected a discussion session");
  }

  const voting = startWordWolfVoting({
    channelId: "channel-1",
    playerId: "user-1",
    engine,
    registry
  });

  if (voting.status !== "started") {
    throw new Error("Expected a voting session");
  }

  return { engine, registry };
}
