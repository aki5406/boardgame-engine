import { describe, expect, it } from "vitest";

import {
  ITO_ASSIGN_BUTTON_CUSTOM_ID,
  createItoAssignedReply,
  createItoCreatedReply,
  createItoDeliverButtonRow,
  createItoDeliveredReply,
  createItoDiscussionStartedReply,
  createItoDiscussionButtonRow,
  createItoProgressionButtonRow,
  createItoRevealButtonRow,
  createItoSetupButtonRow,
  createItoStartedReply,
  ITO_DISCUSS_BUTTON_CUSTOM_ID,
  ITO_DELIVER_BUTTON_CUSTOM_ID,
  ITO_JOIN_BUTTON_CUSTOM_ID,
  ITO_REVEAL_BUTTON_CUSTOM_ID,
  ITO_START_BUTTON_CUSTOM_ID
} from "./ito-create.js";

describe("createItoCreatedReply", () => {
  it("formats the create reply with only the setup row", () => {
    const reply = createItoCreatedReply();

    expect(reply.content).toBe("ITO game created!");
    expect(reply.components).toHaveLength(1);
  });
});

describe("createItoStartedReply", () => {
  it("formats the started reply with the progression row", () => {
    const reply = createItoStartedReply(3);

    expect(reply.content).toBe("ITO game started.\nPlayers: 3");
    expect(reply.components).toHaveLength(1);
    expect(reply.components?.[0]).toEqual(createItoProgressionButtonRow());
  });
});

describe("createItoAssignedReply", () => {
  it("formats the assigned reply with the deliver row", () => {
    const reply = createItoAssignedReply(3);

    expect(reply.content).toBe("ITO numbers assigned.\nPlayers: 3");
    expect(reply.components).toHaveLength(1);
    expect(reply.components?.[0]).toEqual(createItoDeliverButtonRow());
  });
});

describe("createItoDeliveredReply", () => {
  it("formats the delivered reply with the discussion row", () => {
    const reply = createItoDeliveredReply(3, 0);

    expect(reply.content).toBe("ITO numbers delivered.\nSucceeded: 3\nFailed: 0");
    expect(reply.components).toHaveLength(1);
    expect(reply.components?.[0]).toEqual(createItoDiscussionButtonRow());
  });
});

describe("createItoDiscussionStartedReply", () => {
  it("formats the discussion started reply with next-step guidance", () => {
    const reply = createItoDiscussionStartedReply("Favorite convenience store item", 3);

    expect(reply).toEqual({
      content:
        "ITO discussion started.\n" +
        "Theme:\n" +
        "Favorite convenience store item\n" +
        "Everyone, discuss without revealing your number.\n" +
        "Players: 3\n" +
        "Next:\n" +
        "Use /ito status to check Player IDs.\n" +
        'Use /ito submit order:"user-1,user-2,user-3"\n' +
        "Then press Reveal Result.",
      components: [createItoRevealButtonRow()]
    });
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

describe("createItoDeliverButtonRow", () => {
  it("builds the deliver action button row", () => {
    expect(createItoDeliverButtonRow().toJSON()).toEqual({
      type: 1,
      components: [
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

describe("createItoDiscussionButtonRow", () => {
  it("builds the discussion action button row", () => {
    expect(createItoDiscussionButtonRow().toJSON()).toEqual({
      type: 1,
      components: [
        {
          type: 2,
          custom_id: ITO_DISCUSS_BUTTON_CUSTOM_ID,
          label: "Start Discussion",
          style: 2
        }
      ]
    });
  });
});

describe("createItoRevealButtonRow", () => {
  it("builds the reveal action button row", () => {
    expect(createItoRevealButtonRow().toJSON()).toEqual({
      type: 1,
      components: [
        {
          type: 2,
          custom_id: ITO_REVEAL_BUTTON_CUSTOM_ID,
          label: "Reveal Result",
          style: 2
        }
      ]
    });
  });
});
