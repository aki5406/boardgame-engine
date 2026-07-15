import { describe, expect, it } from "vitest";

import {
  createJustOneHintPlayerThreadIntro,
  createJustOneHintThreadName,
  createJustOneStartPartialFailureReply,
  createJustOneStartedReply
} from "./just-one-start.js";

describe("createJustOneHintPlayerThreadIntro", () => {
  it("includes the secret word", () => {
    const message = createJustOneHintPlayerThreadIntro("Apple");

    expect(message).toContain("You are a Hint Player.");
    expect(message).toContain("Apple");
    expect(message).toContain("Reply with exactly one hint.");
  });
});

describe("createJustOneStartedReply", () => {
  it("does not expose the secret word in the public channel reply", () => {
    const reply = createJustOneStartedReply("user-1", 2);

    expect(reply).toBe(
      "Just One started.\n\nGuesser: <@user-1>\nHint players: 2\n\nPrivate hint threads have been created."
    );
    expect(reply).not.toContain("Apple");
  });
});

describe("createJustOneStartPartialFailureReply", () => {
  it("does not expose the secret word in the partial failure reply", () => {
    const reply = createJustOneStartPartialFailureReply("user-1", 3, 2, 1);

    expect(reply).toBe(
      "Just One started, but failed to create one or more private hint threads.\n\nGuesser: <@user-1>\nHint players: 3\nThreads created: 2\nThreads failed: 1"
    );
    expect(reply).not.toContain("Apple");
  });
});

describe("createJustOneHintThreadName", () => {
  it("creates a thread name without exposing the secret word", () => {
    expect(createJustOneHintThreadName("user-123456")).toBe("just-one-hint-3456");
  });
});
