import { describe, expect, it } from "vitest";

import {
  createJustOneGuessModal,
  createJustOneGuessingHintsMessage,
  getJustOneGuessTextInputCustomId,
  isJustOneGuessModalCustomId,
  isJustOneSubmitGuessCustomId
} from "./just-one-guessing.js";

describe("createJustOneGuessingHintsMessage", () => {
  it("shows the guesser mention and remaining hints without player metadata", () => {
    const message = createJustOneGuessingHintsMessage({
      guesserId: "guesser-id",
      hints: ["Fruit", "Sweet"]
    });

    expect(message.content).toContain("Hints for <@guesser-id>");
    expect(message.content).toContain("- Fruit");
    expect(message.content).toContain("- Sweet");
    expect(message.content).not.toContain("player-");
    expect(message.content).not.toContain("Apple");
    expect(message.components[0]?.components[0]?.toJSON()).toMatchObject({
      custom_id: "just-one:submit-guess",
      label: "Answer"
    });
  });

  it("handles a game where every hint was removed", () => {
    expect(
      createJustOneGuessingHintsMessage({
        guesserId: "guesser-id",
        hints: []
      }).content
    ).toContain("No hints remain.");
  });

  it("defines stable, secret-free Answer Button and Modal identifiers", () => {
    const modal = createJustOneGuessModal().toJSON();

    expect(isJustOneSubmitGuessCustomId("just-one:submit-guess")).toBe(true);
    expect(isJustOneGuessModalCustomId("just-one:guess-modal")).toBe(true);
    expect(getJustOneGuessTextInputCustomId()).toBe("just-one:guess");
    expect(modal.custom_id).toBe("just-one:guess-modal");
    expect(JSON.stringify(modal)).toContain('"custom_id":"just-one:guess"');
    expect(JSON.stringify(modal)).toContain('"max_length":100');
    expect(JSON.stringify(modal)).toContain('"required":true');
  });
});
