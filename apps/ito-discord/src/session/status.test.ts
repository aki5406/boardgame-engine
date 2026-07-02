import { describe, expect, it } from "vitest";

import {
  createItoEngine,
  type ItoHintSubmittedEvent,
  type ItoOrderSubmittedEvent,
  type ItoResultRevealedEvent
} from "@boardgame/game-ito";

import { assignItoDiscordNumbers } from "./assign.js";
import { createItoDiscordSessionForChannel } from "./create.js";
import { joinItoDiscordSessionForChannel } from "./join.js";
import { createItoDiscordSessionRegistry } from "./registry.js";
import { getItoDiscordSessionStatus } from "./status.js";
import { setItoDiscordSessionTheme } from "./theme.js";

describe("getItoDiscordSessionStatus", () => {
  it("returns notFound when the channel has no session", () => {
    const registry = createItoDiscordSessionRegistry();

    const result = getItoDiscordSessionStatus({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({ status: "notFound" });
  });

  it("returns current game status for an existing channel session", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });
    joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });
    joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-2",
      engine,
      registry
    });
    setItoDiscordSessionTheme({
      channelId: "channel-1",
      theme: "Convenience store joy",
      engine,
      registry
    });
    assignItoDiscordNumbers({
      channelId: "channel-1",
      engine,
      registry
    });

    const assignedSession = registry.get("channel-1");
    if (!assignedSession) {
      throw new Error("Expected session to be registered");
    }

    const hintSubmittedEvent: ItoHintSubmittedEvent = {
      type: "ito.hintSubmitted",
      playerId: "user-1",
      hint: "snack"
    };
    const orderSubmittedEvent: ItoOrderSubmittedEvent = {
      type: "ito.orderSubmitted",
      playerIds: ["user-1", "user-2"]
    };

    const sessionWithHint = engine.applyEvent({
      session: assignedSession,
      event: hintSubmittedEvent
    });
    const sessionWithOrder = engine.applyEvent({
      session: sessionWithHint,
      event: orderSubmittedEvent
    });
    registry.register({
      channelId: "channel-1",
      session: sessionWithOrder
    });

    const result = getItoDiscordSessionStatus({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({
      status: "found",
      phase: "orderSubmitted",
      themeStatus: "set",
      playerCount: 2,
      hintCount: 1,
      numbersStatus: "assigned",
      orderStatus: "submitted",
      resultStatus: "notRevealed"
    });
  });

  it("returns success result status after reveal", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });
    joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-1",
      engine,
      registry
    });
    joinItoDiscordSessionForChannel({
      channelId: "channel-1",
      playerId: "user-2",
      engine,
      registry
    });

    const createdSession = registry.get("channel-1");
    if (!createdSession) {
      throw new Error("Expected session to be registered");
    }

    const resultRevealedEvent: ItoResultRevealedEvent = {
      type: "ito.resultRevealed",
      success: true
    };
    const revealedSession = engine.applyEvent({
      session: createdSession,
      event: resultRevealedEvent
    });
    registry.register({
      channelId: "channel-1",
      session: revealedSession
    });

    const result = getItoDiscordSessionStatus({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({
      status: "found",
      phase: "resultRevealed",
      themeStatus: "notSet",
      playerCount: 2,
      hintCount: 0,
      numbersStatus: "notAssigned",
      orderStatus: "notSubmitted",
      resultStatus: "success"
    });
  });

  it("returns failure result status after reveal", () => {
    const engine = createItoEngine();
    const registry = createItoDiscordSessionRegistry();
    createItoDiscordSessionForChannel({
      channelId: "channel-1",
      engine,
      registry
    });

    const createdSession = registry.get("channel-1");
    if (!createdSession) {
      throw new Error("Expected session to be registered");
    }

    const resultRevealedEvent: ItoResultRevealedEvent = {
      type: "ito.resultRevealed",
      success: false
    };
    const revealedSession = engine.applyEvent({
      session: createdSession,
      event: resultRevealedEvent
    });
    registry.register({
      channelId: "channel-1",
      session: revealedSession
    });

    const result = getItoDiscordSessionStatus({
      channelId: "channel-1",
      registry
    });

    expect(result).toEqual({
      status: "found",
      phase: "resultRevealed",
      themeStatus: "notSet",
      playerCount: 0,
      hintCount: 0,
      numbersStatus: "notAssigned",
      orderStatus: "notSubmitted",
      resultStatus: "failure"
    });
  });
});
