import { describe, expect, it } from "vitest";

import {
  JUST_ONE_PRIVATE_THREAD_POC_DEFAULT_SECRET_WORD,
  createJustOnePrivateThreadPocIntro,
  createJustOnePrivateThreadPocReply
} from "./just-one-private-thread-poc.js";

describe("createJustOnePrivateThreadPocIntro", () => {
  it("includes the secret word in the private thread intro", () => {
    expect(createJustOnePrivateThreadPocIntro("Apple")).toBe(
      "Secret Word:\nApple\n\nReply with exactly one hint."
    );
  });
});

describe("createJustOnePrivateThreadPocReply", () => {
  it("does not expose the secret word in the public reply", () => {
    const reply = createJustOnePrivateThreadPocReply("thread-1", "user-1");

    expect(reply).toContain("Just One private thread PoC created.");
    expect(reply).toContain("Thread ID: thread-1");
    expect(reply).toContain("Invited player: <@user-1>");
    expect(reply).not.toContain(JUST_ONE_PRIVATE_THREAD_POC_DEFAULT_SECRET_WORD);
  });
});
