import { describe, expect, it } from "vitest";

import { formatItoStatusMessage } from "./ito-status.js";

describe("formatItoStatusMessage", () => {
  it("formats a missing ITO game status", () => {
    expect(formatItoStatusMessage({ status: "notFound" })).toBe(
      "No ITO game exists in this channel."
    );
  });

  it("formats the current ITO game status", () => {
    expect(
      formatItoStatusMessage({
        status: "found",
        phase: "discussion",
        themeStatus: "set",
        playerCount: 4,
        playerIds: ["user-1", "user-2", "user-3", "user-4"],
        hintCount: 3,
        numbersStatus: "assigned",
        orderStatus: "notSubmitted",
        resultStatus: "notRevealed"
      })
    ).toBe(
      "ITO game status\nPhase: discussion\nTheme: set\nPlayers: 4\nPlayer IDs:\n- user-1\n- user-2\n- user-3\n- user-4\nHints: 3\nNumbers: assigned\nOrder: not submitted\nResult: not revealed"
    );
  });

  it("formats a successful ITO result status", () => {
    expect(
      formatItoStatusMessage({
        status: "found",
        phase: "resultRevealed",
        themeStatus: "set",
        playerCount: 3,
        playerIds: ["user-1", "user-2", "user-3"],
        hintCount: 0,
        numbersStatus: "assigned",
        orderStatus: "submitted",
        resultStatus: "success"
      })
    ).toBe(
      "ITO game status\nPhase: resultRevealed\nTheme: set\nPlayers: 3\nPlayer IDs:\n- user-1\n- user-2\n- user-3\nHints: 0\nNumbers: assigned\nOrder: submitted\nResult: success"
    );
  });

  it("formats a failed ITO result status", () => {
    expect(
      formatItoStatusMessage({
        status: "found",
        phase: "resultRevealed",
        themeStatus: "set",
        playerCount: 3,
        playerIds: ["user-1", "user-2", "user-3"],
        hintCount: 0,
        numbersStatus: "assigned",
        orderStatus: "submitted",
        resultStatus: "failure"
      })
    ).toBe(
      "ITO game status\nPhase: resultRevealed\nTheme: set\nPlayers: 3\nPlayer IDs:\n- user-1\n- user-2\n- user-3\nHints: 0\nNumbers: assigned\nOrder: submitted\nResult: failure"
    );
  });

  it("formats empty player ids as none", () => {
    expect(
      formatItoStatusMessage({
        status: "found",
        phase: "waitingForPlayers",
        themeStatus: "notSet",
        playerCount: 0,
        playerIds: [],
        hintCount: 0,
        numbersStatus: "notAssigned",
        orderStatus: "notSubmitted",
        resultStatus: "notRevealed"
      })
    ).toBe(
      "ITO game status\nPhase: waitingForPlayers\nTheme: not set\nPlayers: 0\nPlayer IDs: none\nHints: 0\nNumbers: not assigned\nOrder: not submitted\nResult: not revealed"
    );
  });
});
