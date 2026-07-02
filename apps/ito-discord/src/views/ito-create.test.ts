import { describe, expect, it } from "vitest";

import {
  ITO_ASSIGN_BUTTON_CUSTOM_ID,
  createItoCreatedReply,
  createItoProgressionButtonRow,
  createItoSetupButtonRow,
  ITO_DELIVER_BUTTON_CUSTOM_ID,
  ITO_JOIN_BUTTON_CUSTOM_ID,
  ITO_START_BUTTON_CUSTOM_ID
} from "./ito-create.js";

describe("createItoCreatedReply", () => {
  it("formats the create reply with setup and progression rows", () => {
    const reply = createItoCreatedReply();

    expect(reply.content).toBe("ITO game created!");
    expect(reply.components).toHaveLength(2);
  });
});

describe("createItoSetupButtonRow", () => {
  it("builds the setup action buttons row", () => {
    expect(createItoSetupButtonRow().toJSON()).toEqual({
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

describe("createItoProgressionButtonRow", () => {
  it("builds the progression action buttons row", () => {
    expect(createItoProgressionButtonRow().toJSON()).toEqual({
      type: 1,
      components: [
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
