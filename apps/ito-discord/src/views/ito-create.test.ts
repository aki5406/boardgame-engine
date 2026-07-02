import { describe, expect, it } from "vitest";

import {
  createItoCreatedReply,
  createItoJoinButtonRow,
  ITO_JOIN_BUTTON_CUSTOM_ID
} from "./ito-create.js";

describe("createItoCreatedReply", () => {
  it("formats the create reply with a join button", () => {
    const reply = createItoCreatedReply();

    expect(reply.content).toBe("ITO game created!");
    expect(reply.components).toHaveLength(1);
  });
});

describe("createItoJoinButtonRow", () => {
  it("builds the join button row", () => {
    expect(createItoJoinButtonRow().toJSON()).toEqual({
      type: 1,
      components: [
        {
          type: 2,
          custom_id: ITO_JOIN_BUTTON_CUSTOM_ID,
          label: "Join ITO Game",
          style: 1
        }
      ]
    });
  });
});
