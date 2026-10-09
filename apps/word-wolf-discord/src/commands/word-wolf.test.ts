import { describe, expect, it } from "vitest";

import { wordWolfCommand } from "./word-wolf.js";

describe("wordWolfCommand", () => {
  it("defines create, join, and start subcommands", () => {
    expect(wordWolfCommand.toJSON()).toMatchObject({
      name: "word-wolf",
      options: [
        { name: "create", type: 1 },
        { name: "join", type: 1 },
        { name: "start", type: 1 }
      ]
    });
  });
});
