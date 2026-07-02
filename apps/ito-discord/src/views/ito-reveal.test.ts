import { describe, expect, it } from "vitest";

import { formatItoRevealMessage } from "./ito-reveal.js";

describe("formatItoRevealMessage", () => {
  it("formats the revealed ITO result", () => {
    expect(
      formatItoRevealMessage({
        status: "revealed",
        session: {} as never,
        items: [
          { playerId: "user-1", number: 42 },
          { playerId: "user-2", number: 71 },
          { playerId: "user-3", number: 88 }
        ],
        success: true
      })
    ).toBe(
      "ITO Result\n\nSubmitted:\n1. user-1 - 42\n2. user-2 - 71\n3. user-3 - 88\n\nSuccess: ✅"
    );
  });
});
