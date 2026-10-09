import { describe, expect, it } from "vitest";

import {
  createWordWolfPrivateWordMessage,
  createWordWolfStartedReply,
  createWordWolfStartPartialFailureReply,
  createWordWolfVotingStartedReply,
  WORD_WOLF_START_VOTING_CUSTOM_ID
} from "./word-wolf-start.js";

describe("Word Wolf start views", () => {
  it("places only the assigned word in the private message", () => {
    const message = createWordWolfPrivateWordMessage("Coffee");

    expect(message).toBe("Your word: Coffee");
    expect(message).not.toContain("Minority");
    expect(message).not.toContain("role");
  });

  it("does not include secrets in public start messages", () => {
    const started = createWordWolfStartedReply(3);
    const partialFailure = createWordWolfStartPartialFailureReply(3, 2, 1);
    const voting = createWordWolfVotingStartedReply();

    for (const message of [started.content, partialFailure, voting.content]) {
      expect(message).not.toContain("Coffee");
      expect(message).not.toContain("Tea");
      expect(message).not.toContain("user-1");
      expect(message).not.toContain("Minority");
    }
  });

  it("adds a Start voting button to the discussion message", () => {
    const reply = createWordWolfStartedReply(3);

    expect(reply.components).toHaveLength(1);
    expect(reply.components[0]?.components[0]?.toJSON()).toMatchObject({
      custom_id: WORD_WOLF_START_VOTING_CUSTOM_ID
    });
  });

  it("removes components from the voting started message", () => {
    expect(createWordWolfVotingStartedReply()).toMatchObject({
      content: expect.stringContaining("Votes stay hidden until reveal."),
      components: []
    });
  });
});
