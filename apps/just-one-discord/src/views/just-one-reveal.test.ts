import { describe, expect, it } from "vitest";

import {
  createJustOneRevealMessage,
  isJustOneScoreRoundCustomId,
  parseJustOneResultCustomId
} from "./just-one-reveal.js";

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

  it("shows a confirmed result with a Score round button", () => {
    const message = createJustOneRevealMessage({
      guesserId: "guesser-id",
      guess: "Orange",
      secretWord: "Apple",
      result: "incorrect"
    });

    expect(message.content).toContain("Result: Incorrect");
    expect(message.components[0]?.components[0]?.toJSON()).toMatchObject({
      custom_id: "just-one:score-round",
      label: "Score round"
    });
  });

  it("shows the round points and total score without controls after scoring", () => {
    const message = createJustOneRevealMessage({
      guesserId: "guesser-id",
      guess: "Orange",
      secretWord: "Apple",
      result: "incorrect",
      points: 0,
      totalScore: 3
    });

    expect(message.content).toContain("Round complete");
    expect(message.content).toContain("Points this round: +0");
    expect(message.content).toContain("Total score: 3");
    expect(message.components).toEqual([]);
  });

  it("uses stable custom IDs without answer content", () => {
    expect(parseJustOneResultCustomId("just-one:result:correct")).toBe("correct");
    expect(parseJustOneResultCustomId("just-one:result:incorrect")).toBe("incorrect");
    expect(parseJustOneResultCustomId("just-one:result:Apple")).toBeUndefined();
    expect(isJustOneScoreRoundCustomId("just-one:score-round")).toBe(true);
  });
});
