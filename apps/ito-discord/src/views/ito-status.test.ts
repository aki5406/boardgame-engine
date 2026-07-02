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
        hintCount: 3,
        numbersStatus: "assigned",
        orderStatus: "notSubmitted"
      })
    ).toBe(
      "ITO game status\nPhase: discussion\nTheme: set\nPlayers: 4\nHints: 3\nNumbers: assigned\nOrder: not submitted"
    );
  });
});
