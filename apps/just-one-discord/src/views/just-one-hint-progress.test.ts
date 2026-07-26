import { describe, expect, it } from "vitest";

import { createJustOneHintProgressMessage } from "./just-one-hint-progress.js";

describe("createJustOneHintProgressMessage", () => {
  it("does not expose secret or hint information", () => {
    expect(
      createJustOneHintProgressMessage({
        submittedCount: 2,
        totalCount: 4,
        allSubmitted: false
      })
    ).toBe("Hint progress: 2 / 4 submitted");
  });
});
