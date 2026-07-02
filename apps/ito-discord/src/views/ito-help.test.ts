import { describe, expect, it } from "vitest";

import { formatItoHelpMessage } from "./ito-help.js";

describe("formatItoHelpMessage", () => {
  it("formats the available ITO commands", () => {
    expect(formatItoHelpMessage()).toBe(
      [
        "ITO commands",
        "",
        "/ito create - Create an ITO game in this channel.",
        "/ito join - Join the current ITO game.",
        "/ito status - Show the current ITO game status.",
        "/ito reset - Reset the current ITO game.",
        "/ito start - Start the current ITO game.",
        "/ito theme - Set the game theme.",
        "/ito assign - Assign numbers to players.",
        "/ito deliver - Deliver assigned numbers by DM.",
        "/ito discuss - Start the discussion phase.",
        "/ito ping - Check whether the bot is responding."
      ].join("\n")
    );
  });
});
