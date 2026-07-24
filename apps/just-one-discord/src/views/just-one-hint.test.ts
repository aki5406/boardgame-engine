import { describe, expect, it } from "vitest";

import { createJustOneHintConfirmationReply } from "./just-one-hint.js";

describe("createJustOneHintConfirmationReply", () => {
  it("returns the initial submission message", () => {
    expect(createJustOneHintConfirmationReply("submitted")).toBe("Hint submitted.");
  });

  it("returns the update message", () => {
    expect(createJustOneHintConfirmationReply("updated")).toBe("Hint updated.");
  });
});
