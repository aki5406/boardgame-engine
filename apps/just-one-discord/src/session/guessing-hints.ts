import { getRemainingHints } from "@boardgame/game-just-one";

import { getJustOneState } from "./state.js";
import type { JustOneDiscordSessionRegistry } from "./registry.js";
import { createJustOneGuessingHintsMessage } from "../views/just-one-guessing.js";

export type GetJustOneGuessingHintsResult =
  | Readonly<{
      status: "ready";
      sessionId: string;
      guesserId: string;
      hints: readonly string[];
    }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "invalidState" }>;

export interface GetJustOneGuessingHintsInput {
  readonly channelId: string;
  readonly registry: JustOneDiscordSessionRegistry;
}

export type PublishJustOneGuessingHintsResult =
  | Readonly<{ status: "published" }>
  | Exclude<GetJustOneGuessingHintsResult, Readonly<{ status: "ready" }>>;

export interface PublishJustOneGuessingHintsInput extends GetJustOneGuessingHintsInput {
  readonly publishMessage: (input: {
    readonly content: string;
    readonly components: ReturnType<typeof createJustOneGuessingHintsMessage>["components"];
    readonly guesserId: string;
  }) => Promise<Readonly<{ messageId: string }>>;
}

export function getJustOneGuessingHints(
  input: GetJustOneGuessingHintsInput
): GetJustOneGuessingHintsResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const state = getJustOneState(session);

  if (state.phase !== "guessing" || !state.guesserId) {
    return { status: "invalidState" };
  }

  return {
    status: "ready",
    sessionId: session.id,
    guesserId: state.guesserId,
    hints: getRemainingHints(state).map((hint) => hint.hint)
  };
}

export async function publishJustOneGuessingHints(
  input: PublishJustOneGuessingHintsInput
): Promise<PublishJustOneGuessingHintsResult> {
  const result = getJustOneGuessingHints(input);

  if (result.status !== "ready") {
    return result;
  }

  const message = createJustOneGuessingHintsMessage(result);
  const publishedMessage = await input.publishMessage({
    content: message.content,
    components: message.components,
    guesserId: result.guesserId
  });

  input.registry.registerGuessingMessage({
    channelId: input.channelId,
    sessionId: result.sessionId,
    messageId: publishedMessage.messageId
  });

  return { status: "published" };
}
