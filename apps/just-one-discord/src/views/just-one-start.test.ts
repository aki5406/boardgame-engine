import { describe, expect, it } from "vitest";

import {
  createJustOneGuesserRoleMessage,
  createJustOneHintPlayerRoleMessage,
  createJustOneStartedReply
} from "./just-one-start.js";

describe("createJustOneGuesserRoleMessage", () => {
  it("does not include the secret word", () => {
    const message = createJustOneGuesserRoleMessage();

    expect(message).toContain("You are the Guesser.");
    expect(message).not.toContain("Apple");
  });
});

describe("createJustOneHintPlayerRoleMessage", () => {
  it("includes the secret word", () => {
    const message = createJustOneHintPlayerRoleMessage("Apple");

    expect(message).toContain("You are a Hint Player.");
    expect(message).toContain("Apple");
  });
});

describe("createJustOneStartedReply", () => {
  it("does not expose the secret word in the public channel reply", () => {
    const reply = createJustOneStartedReply("user-1", 2);

    expect(reply).toBe(
      "Just One started.\n\nGuesser: <@user-1>\nHint players: 2\n\nRoles have been sent by DM."
    );
    expect(reply).not.toContain("Apple");
  });
});
