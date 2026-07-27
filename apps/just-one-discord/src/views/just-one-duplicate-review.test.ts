import { describe, expect, it } from "vitest";

import {
  createJustOneDuplicateReviewFailureReply,
  createJustOneDuplicateReviewIntro,
  createJustOneDuplicateReviewThreadName
} from "./just-one-duplicate-review.js";

describe("createJustOneDuplicateReviewIntro", () => {
  it("lists hints in player join order without identifying their authors", () => {
    const message = createJustOneDuplicateReviewIntro({
      phase: "duplicateReview",
      players: ["guesser-id", "first-hint-player", "second-hint-player"],
      guesserId: "guesser-id",
      secretWord: "Apple",
      hintsByPlayerId: {
        "second-hint-player": "Red",
        "first-hint-player": "Fruit"
      }
    });

    expect(message).toContain("1. Fruit");
    expect(message).toContain("2. Red");
    expect(message).not.toContain("first-hint-player");
    expect(message).not.toContain("second-hint-player");
    expect(message).not.toContain("Apple");
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
