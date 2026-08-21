import { describe, expect, it } from "vitest";

import { createJustOneEngine } from "@boardgame/game-just-one";

import { finishJustOneGame } from "./finish.js";
import { createJustOneDiscordSessionRegistry } from "./registry.js";
import { getJustOneState } from "./state.js";

describe("finishJustOneGame", () => {
  it("finishes a final scored round and updates the registry", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();
    registry.register({
      channelId: "channel-1",
      session: engine.startSession({
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
      })
    });

    expect(finishJustOneGame({ channelId: "channel-1", engine, registry })).toMatchObject({
      status: "finished"
    });
    expect(getJustOneState(registry.get("channel-1")!)).toMatchObject({
      phase: "finished",
      score: 9,
      roundNumber: 13
    });
  });

  it("does not finish before the final round", () => {
    const engine = createJustOneEngine();
    const registry = createJustOneDiscordSessionRegistry();
    registry.register({
      channelId: "channel-1",
      session: engine.startSession({
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
          roundNumber: 12,
          hintsByPlayerId: {},
          excludedHintPlayerIds: []
        }
      })
    });

    expect(finishJustOneGame({ channelId: "channel-1", engine, registry })).toEqual({
      status: "notFinalRound"
    });
  });
});
