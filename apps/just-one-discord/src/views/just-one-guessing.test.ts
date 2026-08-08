import { describe, expect, it } from "vitest";

import { createJustOneGuessingHintsMessage } from "./just-one-guessing.js";

describe("createJustOneGuessingHintsMessage", () => {
  it("shows the guesser mention and remaining hints without player metadata", () => {
    const message = createJustOneGuessingHintsMessage({
      guesserId: "guesser-id",
      hints: ["Fruit", "Sweet"]
    });

    expect(message).toContain("Hints for <@guesser-id>");
    expect(message).toContain("- Fruit");
    expect(message).toContain("- Sweet");
    expect(message).not.toContain("player-");
    expect(message).not.toContain("Apple");
  });

  it("handles a game where every hint was removed", () => {
    expect(
      createJustOneGuessingHintsMessage({
        guesserId: "guesser-id",
        hints: []
      })
    ).toContain("No hints remain.");
  });
});
