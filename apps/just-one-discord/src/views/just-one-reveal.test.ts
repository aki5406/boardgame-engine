import { describe, expect, it } from "vitest";

import {
  createJustOneRevealMessage,
  isJustOneFinishGameCustomId,
  isJustOneNextRoundCustomId,
  isJustOneScoreRoundCustomId,
  parseJustOneResultCustomId
} from "./just-one-reveal.js";

describe("createJustOneRevealMessage", () => {
  it("reveals the guess and secret word with result buttons", () => {
    const message = createJustOneRevealMessage({
      guesserId: "guesser-id",
      guess: "Orange",
      secretWord: "Apple",
      roundNumber: 1
    });

    expect(message.content).toContain("Guesser: <@guesser-id>");
    expect(message.content).toContain("Round: 1");
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
      roundNumber: 1,
      result: "incorrect"
    });

    expect(message.content).toContain("Result: Incorrect");
    expect(message.components[0]?.components[0]?.toJSON()).toMatchObject({
      custom_id: "just-one:score-round",
      label: "Score round"
    });
  });

  it("shows the round points, total score, and next round control after scoring", () => {
    const message = createJustOneRevealMessage({
      guesserId: "guesser-id",
      guess: "Orange",
      secretWord: "Apple",
      roundNumber: 2,
      result: "incorrect",
      points: 0,
      totalScore: 3
    });

    expect(message.content).toContain("Round complete");
    expect(message.content).toContain("Round: 2");
    expect(message.content).toContain("Points this round: +0");
    expect(message.content).toContain("Total score: 3");
    expect(message.components[0]?.components[0]?.toJSON()).toMatchObject({
      custom_id: "just-one:next-round",
      label: "Next round"
    });
  });

  it("shows a finish game control for a scored final round", () => {
    const message = createJustOneRevealMessage({
      guesserId: "guesser-id",
      guess: "Orange",
      secretWord: "Apple",
      roundNumber: 13,
      result: "incorrect",
      points: 0,
      totalScore: 9,
      canFinish: true
    });

    expect(message.components[0]?.components[0]?.toJSON()).toMatchObject({
      custom_id: "just-one:finish-game",
      label: "Finish game"
    });
  });

  it("shows the final score without controls after the game finishes", () => {
    const message = createJustOneRevealMessage({
      guesserId: "guesser-id",
      guess: "Orange",
      secretWord: "Apple",
      roundNumber: 13,
      result: "incorrect",
      points: 0,
      totalScore: 9,
      finished: true
    });

    expect(message.content).toContain("Game finished");
    expect(message.content).toContain("Final score: 9");
    expect(message.components).toEqual([]);
  });

  it("uses stable custom IDs without answer content", () => {
    expect(parseJustOneResultCustomId("just-one:result:correct")).toBe("correct");
    expect(parseJustOneResultCustomId("just-one:result:incorrect")).toBe("incorrect");
    expect(parseJustOneResultCustomId("just-one:result:Apple")).toBeUndefined();
    expect(isJustOneScoreRoundCustomId("just-one:score-round")).toBe(true);
    expect(isJustOneNextRoundCustomId("just-one:next-round")).toBe(true);
    expect(isJustOneFinishGameCustomId("just-one:finish-game")).toBe(true);
  });
});
