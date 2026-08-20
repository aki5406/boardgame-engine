import { describe, expect, it } from "vitest";

import { createJustOneRevealMessage, parseJustOneResultCustomId } from "./just-one-reveal.js";

describe("createJustOneRevealMessage", () => {
  it("reveals the guess and secret word with result buttons", () => {
    const message = createJustOneRevealMessage({
      guesserId: "guesser-id",
      guess: "Orange",
      secretWord: "Apple"
    });

    expect(message.content).toContain("Guesser: <@guesser-id>");
    expect(message.content).toContain("Guess: Orange");
    expect(message.content).toContain("Secret Word: Apple");
    expect(message.components[0]?.components.map((component) => component.toJSON())).toEqual([
      expect.objectContaining({ custom_id: "just-one:result:correct", label: "Correct" }),
      expect.objectContaining({ custom_id: "just-one:result:incorrect", label: "Incorrect" })
    ]);
  });

  it("shows a confirmed result without controls", () => {
    const message = createJustOneRevealMessage({
      guesserId: "guesser-id",
      guess: "Orange",
      secretWord: "Apple",
      result: "incorrect"
    });

    expect(message.content).toContain("Result: Incorrect");
    expect(message.components).toEqual([]);
  });

  it("uses stable custom IDs without answer content", () => {
    expect(parseJustOneResultCustomId("just-one:result:correct")).toBe("correct");
    expect(parseJustOneResultCustomId("just-one:result:incorrect")).toBe("incorrect");
    expect(parseJustOneResultCustomId("just-one:result:Apple")).toBeUndefined();
  });
});
