import { describe, expect, it } from "vitest";

import {
  ITO_ASSIGN_BUTTON_CUSTOM_ID,
  ITO_ASSIGN_DELIVER_BUTTON_CUSTOM_ID,
  ITO_DISCUSS_BUTTON_CUSTOM_ID,
  ITO_DELIVER_BUTTON_CUSTOM_ID,
  ITO_JOIN_BUTTON_CUSTOM_ID,
  ITO_REVEAL_BUTTON_CUSTOM_ID,
  ITO_START_BUTTON_CUSTOM_ID,
  ITO_THEME_BUTTON_CUSTOM_ID,
  ITO_THEME_MODAL_CUSTOM_ID,
  ITO_THEME_TOPIC_INPUT_CUSTOM_ID,
  createItoAssignedAndDeliveredReply,
  createItoAssignedReply,
  createItoAssignButtonRow,
  createItoAssignDeliverButtonRow,
  createItoCreatedReply,
  createItoDeliveredReply,
  createItoDeliverButtonRow,
  createItoDiscussionButtonRow,
  createItoDiscussionStartedReply,
  createItoProgressionButtonRow,
  createItoRevealButtonRow,
  createItoSetupButtonRow,
  createItoStartedReply,
  createItoThemeButtonRow,
  createItoThemeModal,
  createItoThemeSetReply
} from "./ito-create.js";

describe("createItoCreatedReply", () => {
  it("formats the create reply with only the setup row", () => {
    const reply = createItoCreatedReply();

    expect(reply.content).toBe("ITO game created!");
    expect(reply.components).toHaveLength(1);
  });
});

describe("createItoStartedReply", () => {
  it("formats the started reply with the theme guidance row", () => {
    const reply = createItoStartedReply(3);

    expect(reply.content).toBe("ITO game started.\nPlayers: 3\n\nNext:\nSet the theme.");
    expect(reply.components).toHaveLength(1);
    expect(reply.components?.[0]).toEqual(createItoThemeButtonRow());
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

describe("createItoThemeSetReply", () => {
  it("formats the theme set reply with the assign and deliver row", () => {
    const reply = createItoThemeSetReply("Favorite convenience store item");

    expect(reply.content).toBe("Theme set.\nTheme:\nFavorite convenience store item");
    expect(reply.components).toHaveLength(1);
    expect(reply.components?.[0]).toEqual(createItoAssignDeliverButtonRow());
  });
});

describe("createItoAssignedAndDeliveredReply", () => {
  it("formats the combined assign and deliver reply with the discussion row", () => {
    const reply = createItoAssignedAndDeliveredReply(3, 3, 0);

    expect(reply.content).toBe(
      "Numbers assigned and delivered.\nPlayers: 3\nDelivered:\nSucceeded: 3\nFailed: 0"
    );
    expect(reply.components).toHaveLength(1);
    expect(reply.components?.[0]).toEqual(createItoDiscussionButtonRow());
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
  it("formats the discussion started reply with reveal-focused guidance", () => {
    const reply = createItoDiscussionStartedReply("Favorite convenience store item", 3);

    expect(reply).toEqual({
      content:
        "ITO discussion started.\n" +
        "Theme:\n" +
        "Favorite convenience store item\n" +
        "Everyone, discuss without revealing your number.\n" +
        "Players: 3\n" +
        "\n" +
        "Next:\n" +
        "Discuss using the answers thread.\n" +
        "When everyone is ready, press Reveal Result.",
      components: [createItoRevealButtonRow()]
    });
  });

  it("includes the answer thread url when provided", () => {
    const reply = createItoDiscussionStartedReply(
      "Favorite convenience store item",
      3,
      "https://discord.com/channels/guild/thread"
    );

    expect(reply).toEqual({
      content:
        "ITO discussion started.\n" +
        "Theme:\n" +
        "Favorite convenience store item\n" +
        "Everyone, discuss without revealing your number.\n" +
        "Players: 3\n" +
        "回答スレッド:\n" +
        "https://discord.com/channels/guild/thread\n" +
        "\n" +
        "Next:\n" +
        "Discuss using the answers thread.\n" +
        "When everyone is ready, press Reveal Result.",
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

describe("createItoThemeButtonRow", () => {
  it("builds the theme action button row", () => {
    expect(createItoThemeButtonRow().toJSON()).toEqual({
      type: 1,
      components: [
        {
          type: 2,
          custom_id: ITO_THEME_BUTTON_CUSTOM_ID,
          label: "Set Theme",
          style: 2
        }
      ]
    });
  });
});

describe("createItoAssignButtonRow", () => {
  it("builds the assign action button row", () => {
    expect(createItoAssignButtonRow().toJSON()).toEqual({
      type: 1,
      components: [
        {
          type: 2,
          custom_id: ITO_ASSIGN_BUTTON_CUSTOM_ID,
          label: "Assign Numbers",
          style: 2
        }
      ]
    });
  });
});

describe("createItoAssignDeliverButtonRow", () => {
  it("builds the assign and deliver action button row", () => {
    expect(createItoAssignDeliverButtonRow().toJSON()).toEqual({
      type: 1,
      components: [
        {
          type: 2,
          custom_id: ITO_ASSIGN_DELIVER_BUTTON_CUSTOM_ID,
          label: "Assign & Deliver Numbers",
          style: 2
        }
      ]
    });
  });
});

describe("createItoThemeModal", () => {
  it("builds the theme modal", () => {
    expect(createItoThemeModal().toJSON()).toEqual({
      title: "Set Theme",
      custom_id: ITO_THEME_MODAL_CUSTOM_ID,
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: ITO_THEME_TOPIC_INPUT_CUSTOM_ID,
              label: "Theme",
              style: 1,
              placeholder: "好きなコンビニ商品",
              required: true
            }
          ]
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
