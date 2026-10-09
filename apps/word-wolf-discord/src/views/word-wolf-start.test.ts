import { describe, expect, it } from "vitest";

import {
  createWordWolfPrivateWordMessage,
  createWordWolfStartedReply,
  createWordWolfStartPartialFailureReply,
  createWordWolfVotingStartedReply,
  WORD_WOLF_START_VOTING_CUSTOM_ID,
  WORD_WOLF_VOTE_CUSTOM_ID
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
    const voting = createWordWolfVotingStartedReply({
      playerIds: ["user-1", "user-2", "user-3"],
      submittedVotes: 0,
      totalVotes: 3,
      complete: false
    });

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

  it("adds a player select menu and aggregate progress to the voting message", () => {
    const reply = createWordWolfVotingStartedReply({
      playerIds: ["user-1", "user-2", "user-3"],
      submittedVotes: 1,
      totalVotes: 3,
      complete: false
    });

    expect(reply).toMatchObject({
      content: expect.stringContaining("Votes stay hidden until reveal."),
      components: [expect.anything()]
    });
    expect(reply.content).toContain("Votes: 1 / 3");
    expect(reply.content).not.toContain("voted for");
    expect(reply.components[0]?.components[0]?.toJSON()).toMatchObject({
      custom_id: WORD_WOLF_VOTE_CUSTOM_ID,
      disabled: false,
      options: [
        { label: "user-1", value: "user-1" },
        { label: "user-2", value: "user-2" },
        { label: "user-3", value: "user-3" }
      ]
    });
  });

  it("disables the select menu when all votes are submitted", () => {
    const reply = createWordWolfVotingStartedReply({
      playerIds: ["user-1", "user-2", "user-3"],
      submittedVotes: 3,
      totalVotes: 3,
      complete: true
    });

    expect(reply.content).toContain("All votes are in.");
    expect(reply.components[0]?.components[0]?.toJSON()).toMatchObject({ disabled: true });
  });
});
