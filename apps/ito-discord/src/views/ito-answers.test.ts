import { describe, expect, it } from "vitest";

import {
  createItoAnswerStatusMessage,
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
      "回答状況\n" +
        "⬜ <@123456789>\n" +
        "⬜ <@987654321>\n" +
        "回答スレッド:\n" +
        "https://discord.com/channels/guild/thread"
    );
  });

  it("formats answered players with check marks", () => {
    expect(
      createItoAnswerStatusMessage(
        ["123456789", "987654321"],
        "https://discord.com/channels/guild/thread",
        ["987654321"]
      )
    ).toBe(
      "回答状況\n" +
        "⬜ <@123456789>\n" +
        "✅ <@987654321>\n" +
        "回答スレッド:\n" +
        "https://discord.com/channels/guild/thread"
    );
  });
});
