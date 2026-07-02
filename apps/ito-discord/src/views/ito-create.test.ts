import { describe, expect, it } from "vitest";

import {
  ITO_ASSIGN_BUTTON_CUSTOM_ID,
  createItoCreatedReply,
  createItoCreateButtonRow,
  ITO_DELIVER_BUTTON_CUSTOM_ID,
  ITO_JOIN_BUTTON_CUSTOM_ID,
  ITO_START_BUTTON_CUSTOM_ID
} from "./ito-create.js";

describe("createItoCreatedReply", () => {
  it("formats the create reply with join, start, assign, and deliver buttons", () => {
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
        },
        {
          type: 2,
          custom_id: ITO_ASSIGN_BUTTON_CUSTOM_ID,
          label: "Assign Numbers",
          style: 2
        },
        {
          type: 2,
          custom_id: ITO_DELIVER_BUTTON_CUSTOM_ID,
          label: "Deliver Numbers",
          style: 2
        }
      ]
    });
  });
});
