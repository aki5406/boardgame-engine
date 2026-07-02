import type { Engine, ItoDiscussionStartedEvent } from "@boardgame/game-ito";

import { getItoState } from "./ito-state.js";
import type { ItoDiscordSession, ItoDiscordSessionRegistry } from "./registry.js";

export type StartItoDiscordDiscussionResult =
  | Readonly<{
      status: "discussionStarted";
      session: ItoDiscordSession;
      theme: string;
      playerCount: number;
    }>
  | Readonly<{ status: "notAssigned" }>
  | Readonly<{ status: "noTheme" }>
  | Readonly<{ status: "notFound" }>;

export interface StartItoDiscordDiscussionInput {
  readonly channelId: string;
  readonly engine: Engine;
  readonly registry: ItoDiscordSessionRegistry;
}

export function startItoDiscordDiscussion(
  input: StartItoDiscordDiscussionInput
): StartItoDiscordDiscussionResult {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const state = getItoState(session);

  if (!state.theme) {
    return { status: "noTheme" };
  }

  if (!state.assignedNumbers || state.assignedNumbers.length === 0) {
    return { status: "notAssigned" };
  }

  const event: ItoDiscussionStartedEvent = {
    type: "ito.discussionStarted"
  };
  const nextSession = input.engine.applyEvent({
    session,
    event
  });

  input.registry.register({
    channelId: input.channelId,
    session: nextSession
  });

  return {
    status: "discussionStarted",
    session: nextSession,
    theme: state.theme,
    playerCount: state.assignedNumbers.length
  };
}
