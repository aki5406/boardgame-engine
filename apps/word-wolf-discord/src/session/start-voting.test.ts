import { describe, expect, it } from "vitest";

import { createWordWolfEngine, type WordWolfState } from "@boardgame/game-word-wolf";

import { createWordWolfDiscordSessionForChannel } from "./create.js";
import { joinWordWolfDiscordSessionForChannel } from "./join.js";
import { createWordWolfDiscordSessionRegistry } from "./registry.js";
import { startWordWolfDiscordSession } from "./start.js";
import { startWordWolfVoting } from "./start-voting.js";

describe("startWordWolfVoting", () => {
  it("starts voting for a participant and updates the registry", () => {
    const { engine, registry } = createDiscussionSession();

    const result = startWordWolfVoting({
      channelId: "channel-1",
      playerId: "user-2",
      engine,
      registry
    });

    expect(result.status).toBe("started");
    if (result.status !== "started") {
      return;
    }

    expect(result.session.state as WordWolfState).toMatchObject({ phase: "voting" });
    expect(registry.get("channel-1")).toBe(result.session);
  });

  it("rejects a missing session and a non-participant", () => {
    const engine = createWordWolfEngine();
    const registry = createWordWolfDiscordSessionRegistry();

    expect(
      startWordWolfVoting({
        channelId: "channel-1",
        playerId: "user-1",
        engine,
        registry
      })
    ).toEqual({ status: "notFound" });

    const discussion = createDiscussionSession();
    expect(
      startWordWolfVoting({
        channelId: "channel-1",
        playerId: "not-a-player",
        engine: discussion.engine,
        registry: discussion.registry
      })
    ).toEqual({ status: "notParticipant" });
  });
});

function createDiscussionSession() {
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

  const result = startWordWolfDiscordSession({
    channelId: "channel-1",
    engine,
    registry,
    random: () => 0,
    wordPairs: [{ words: ["Coffee", "Tea"] }]
  });

  if (result.status !== "started") {
    throw new Error("Expected a discussion session");
  }

  return { engine, registry };
}
