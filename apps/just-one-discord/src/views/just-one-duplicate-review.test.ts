import { describe, expect, it } from "vitest";

import {
  createJustOneDuplicateReviewButtonRows,
  createJustOneConfirmHintsCustomId,
  createJustOneDuplicateReviewFailureReply,
  createJustOneDuplicateReviewMessage,
  createJustOneHintToggleCustomId,
  createJustOneDuplicateReviewThreadName,
  parseJustOneHintToggleCustomId
} from "./just-one-duplicate-review.js";

describe("createJustOneDuplicateReviewMessage", () => {
  it("lists hints in player join order without identifying their authors", () => {
    const message = createJustOneDuplicateReviewMessage({
      phase: "duplicateReview",
      players: ["guesser-id", "first-hint-player", "second-hint-player"],
      guesserId: "guesser-id",
      secretWord: "Apple",
      guess: null,
      result: null,
      hintsByPlayerId: {
        "second-hint-player": "Red",
        "first-hint-player": "Fruit"
      },
      excludedHintPlayerIds: []
    });

    expect(message.content).toContain("1. Fruit");
    expect(message.content).toContain("2. Red");
    expect(message.content).not.toContain("first-hint-player");
    expect(message.content).not.toContain("second-hint-player");
    expect(message.content).not.toContain("Apple");
  });

  it("renders remove and restore buttons in rows of five", () => {
    const hints = Array.from({ length: 6 }, (_, index) => ({
      playerId: `player-${index + 1}`,
      hint: `Hint ${index + 1}`,
      excluded: index === 0
    }));
    const rows = createJustOneDuplicateReviewButtonRows(hints);

    expect(rows).toHaveLength(3);
    expect(rows[0]?.components).toHaveLength(5);
    expect(rows[1]?.components).toHaveLength(1);
    expect(rows[2]?.components).toHaveLength(1);
    expect(rows[0]?.components[0]?.toJSON()).toMatchObject({
      custom_id: createJustOneHintToggleCustomId("player-1"),
      label: "1: Restore"
    });
    expect(rows[0]?.components[1]?.toJSON()).toMatchObject({
      custom_id: createJustOneHintToggleCustomId("player-2"),
      label: "2: Remove"
    });
    const firstButton = rows[0]?.components[0]?.toJSON();
    expect("custom_id" in (firstButton ?? {})).toBe(true);
    if (firstButton && "custom_id" in firstButton) {
      expect(firstButton.custom_id).not.toContain("Hint 1");
    }
    expect(rows[2]?.components[0]?.toJSON()).toMatchObject({
      custom_id: createJustOneConfirmHintsCustomId(),
      label: "Confirm hints"
    });
  });

  it("removes controls and marks the message complete after confirmation", () => {
    const message = createJustOneDuplicateReviewMessage({
      phase: "guessing",
      players: ["guesser-id", "hint-player"],
      guesserId: "guesser-id",
      secretWord: "Apple",
      guess: null,
      result: null,
      hintsByPlayerId: { "hint-player": "Fruit" },
      excludedHintPlayerIds: []
    });

    expect(message.content).toContain("Duplicate review complete");
    expect(message.content).toContain("Hints have been confirmed.");
    expect(message.components).toEqual([]);
  });

  it("parses only valid Just One hint toggle IDs", () => {
    expect(parseJustOneHintToggleCustomId(createJustOneHintToggleCustomId("player-2"))).toBe(
      "player-2"
    );
    expect(parseJustOneHintToggleCustomId("just-one:hint-toggle:")).toBeUndefined();
    expect(parseJustOneHintToggleCustomId("other:hint-toggle:player-2")).toBeUndefined();
  });
});

describe("duplicate review views", () => {
  it("uses a stable thread name and a safe public failure reply", () => {
    expect(createJustOneDuplicateReviewThreadName()).toBe("just-one-duplicate-review");
    expect(createJustOneDuplicateReviewFailureReply()).toBe(
      "All hints were submitted, but duplicate review could not be started."
    );
  });
});
