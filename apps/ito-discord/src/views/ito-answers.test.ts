import { describe, expect, it } from "vitest";

import {
  createItoAnswerStatusMessage,
  createItoAnswerStatusReply,
  createItoAnswersThreadIntro,
  createItoAnswersThreadName
} from "./ito-answers.js";

describe("createItoAnswersThreadName", () => {
  it("builds the answers thread name from the theme", () => {
    expect(createItoAnswersThreadName("Favorite convenience store item")).toBe(
      "ITO answers - Favorite convenience store item"
    );
  });

  it("shortens long theme names", () => {
    const theme = "a".repeat(100);

    expect(createItoAnswersThreadName(theme)).toBe(`ITO answers - ${"a".repeat(77)}...`);
  });
});

describe("createItoAnswersThreadIntro", () => {
  it("formats the answers thread intro message", () => {
    expect(createItoAnswersThreadIntro("Favorite convenience store item")).toBe(
      "ITO 回答スレッド\n" +
        "テーマ:\n" +
        "Favorite convenience store item\n" +
        "このスレッドに、テーマに対するあなたの回答を書いてください。\n" +
        "数字は絶対に書かないでください。\n" +
        "回答だけ投稿してください。"
    );
  });
});

describe("createItoAnswerStatusMessage", () => {
  it("formats the initial answer status message", () => {
    expect(
      createItoAnswerStatusMessage(
        ["123456789", "987654321"],
        "https://discord.com/channels/guild/thread"
      )
    ).toBe(
      "回答状況: 0 / 2\n" +
        "⬜ <@123456789>\n" +
        "⬜ <@987654321>\n" +
        "\n" +
        "回答スレッド:\n" +
        "https://discord.com/channels/guild/thread"
    );
  });

  it("formats answered players with check marks and counts only participants", () => {
    expect(
      createItoAnswerStatusMessage(
        ["123456789", "987654321"],
        "https://discord.com/channels/guild/thread",
        ["987654321", "non-player"]
      )
    ).toBe(
      "回答状況: 1 / 2\n" +
        "⬜ <@123456789>\n" +
        "✅ <@987654321>\n" +
        "\n" +
        "回答スレッド:\n" +
        "https://discord.com/channels/guild/thread"
    );
  });

  it("shows an all answered message when everyone has answered", () => {
    expect(
      createItoAnswerStatusMessage(
        ["123456789", "987654321"],
        "https://discord.com/channels/guild/thread",
        ["123456789", "987654321"]
      )
    ).toBe(
      "回答状況: 2 / 2\n" +
        "全員回答済みです。話し合いを始めましょう。\n" +
        "✅ <@123456789>\n" +
        "✅ <@987654321>\n" +
        "\n" +
        "回答スレッド:\n" +
        "https://discord.com/channels/guild/thread"
    );
  });

  it("does not treat zero players as all answered", () => {
    expect(createItoAnswerStatusMessage([], "https://discord.com/channels/guild/thread", [])).toBe(
      "回答状況: 0 / 0\n" + "\n" + "回答スレッド:\n" + "https://discord.com/channels/guild/thread"
    );
  });
});

describe("createItoAnswerStatusReply", () => {
  it("does not include a discussion button while unanswered players remain", () => {
    expect(
      createItoAnswerStatusReply(
        ["123456789", "987654321"],
        "https://discord.com/channels/guild/thread",
        ["123456789"]
      )
    ).toEqual({
      content:
        "回答状況: 1 / 2\n" +
        "✅ <@123456789>\n" +
        "⬜ <@987654321>\n" +
        "\n" +
        "回答スレッド:\n" +
        "https://discord.com/channels/guild/thread",
      components: []
    });
  });

  it("includes the existing discussion button when everyone has answered", () => {
    const reply = createItoAnswerStatusReply(
      ["123456789", "987654321"],
      "https://discord.com/channels/guild/thread",
      ["123456789", "987654321"]
    );
    const firstComponent = reply.components?.[0];
    const serializedComponent =
      firstComponent && "toJSON" in firstComponent ? firstComponent.toJSON() : firstComponent;

    expect(reply.content).toBe(
      "回答状況: 2 / 2\n" +
        "全員回答済みです。話し合いを始めましょう。\n" +
        "✅ <@123456789>\n" +
        "✅ <@987654321>\n" +
        "\n" +
        "回答スレッド:\n" +
        "https://discord.com/channels/guild/thread"
    );
    expect(reply.components).toHaveLength(1);
    expect(serializedComponent).toEqual({
      type: 1,
      components: [
        {
          type: 2,
          custom_id: "ito.discuss",
          label: "Start Discussion",
          style: 2
        }
      ]
    });
  });
});
