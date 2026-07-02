import { describe, expect, it } from "vitest";

import {
  createItoCreatedReply,
  createItoCreateButtonRow,
  ITO_JOIN_BUTTON_CUSTOM_ID,
  ITO_START_BUTTON_CUSTOM_ID
} from "./ito-create.js";

describe("createItoCreatedReply", () => {
  it("formats the create reply with join and start buttons", () => {
    const reply = createItoCreatedReply();

    expect(reply.content).toBe("ITO game created!");
    expect(reply.components).toHaveLength(1);
  });
});

describe("createItoCreateButtonRow", () => {
  it("builds the create action buttons row", () => {
    expect(createItoCreateButtonRow().toJSON()).toEqual({
      type: 1,
      components: [
        {
          type: 2,
          custom_id: ITO_JOIN_BUTTON_CUSTOM_ID,
          label: "Join ITO Game",
          style: 1
        },
        {
          type: 2,
          custom_id: ITO_START_BUTTON_CUSTOM_ID,
          label: "Start ITO Game",
          style: 2
        }
      ]
    });
  });
});
