import { describe, expect, it } from "vitest";

import {
  createWordWolfPrivateWordMessage,
  createWordWolfStartedReply,
  createWordWolfStartPartialFailureReply
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

    for (const message of [started, partialFailure]) {
      expect(message).not.toContain("Coffee");
      expect(message).not.toContain("Tea");
      expect(message).not.toContain("user-1");
      expect(message).not.toContain("Minority");
    }
  });
});
