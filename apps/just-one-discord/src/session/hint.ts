import { submitHint, type Engine } from "@boardgame/game-just-one";

import type { JustOneDiscordSessionRegistry } from "./registry.js";

export type SubmitJustOneHintFromThreadResult =
  | Readonly<{ status: "ignored"; reason: string }>
  | Readonly<{ status: "submitted" | "updated" }>;

export interface SubmitJustOneHintFromThreadInput {
  readonly threadId: string;
  readonly authorId: string;
  readonly authorIsBot: boolean;
  readonly content: string;
  readonly engine: Engine;
  readonly registry: JustOneDiscordSessionRegistry;
}

export function submitJustOneHintFromThread(
  input: SubmitJustOneHintFromThreadInput
): SubmitJustOneHintFromThreadResult {
  if (input.authorIsBot) {
    return { status: "ignored", reason: "botAuthor" };
  }

  const hintThread = input.registry.getHintThread(input.threadId);

  if (!hintThread) {
    return { status: "ignored", reason: "unregisteredThread" };
  }

  if (hintThread.playerId !== input.authorId) {
    return { status: "ignored", reason: "wrongAuthor" };
  }

  const normalizedHint = input.content.trim();

  if (normalizedHint.length === 0) {
    return { status: "ignored", reason: "emptyHint" };
  }

  const session = input.registry.get(hintThread.channelId);

  if (!session || session.id !== hintThread.sessionId) {
    return { status: "ignored", reason: "sessionNotFound" };
  }

  const result = submitHint({
    engine: input.engine,
    session,
    playerId: input.authorId,
    hint: normalizedHint
  });

  if (result.status === "submitted" || result.status === "updated") {
    input.registry.register({
      channelId: hintThread.channelId,
      session: result.session
    });

    return {
      status: result.status
    };
  }

  return { status: "ignored", reason: result.status };
}
