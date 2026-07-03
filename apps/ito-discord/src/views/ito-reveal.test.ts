import { describe, expect, it } from "vitest";

import { formatItoRevealMessage } from "./ito-reveal.js";

describe("formatItoRevealMessage", () => {
  it("formats the revealed ITO numbers", () => {
    expect(
      formatItoRevealMessage({
        status: "revealed",
        session: {} as never,
        items: [
          { playerId: "user-1", number: 42, answer: "Umaibo" },
          { playerId: "user-2", number: 71, answer: "Karaage-kun" },
          { playerId: "user-3", number: 88, answer: "Premium sushi" }
        ]
      })
    ).toBe(
      "ITO Reveal\n\nNumbers:\n1. <@user-1> - 42\nUmaibo\n2. <@user-2> - 71\nKaraage-kun\n3. <@user-3> - 88\nPremium sushi"
    );
  });

  it("formats unknown numbers and missing answers without showing fake values", () => {
    expect(
      formatItoRevealMessage({
        status: "revealed",
        session: {} as never,
        items: [{ playerId: "user-1", number: undefined, answer: undefined }]
      })
    ).toBe("ITO Reveal\n\nNumbers:\n1. <@user-1> - unknown\n(No answer)");
  });
});
