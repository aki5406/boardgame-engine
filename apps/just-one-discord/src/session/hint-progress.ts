import { getHintSubmissionProgress } from "@boardgame/game-just-one";

import { createJustOneHintProgressMessage } from "../views/just-one-hint-progress.js";
import { getJustOneState } from "./state.js";
import type { JustOneDiscordSessionRegistry } from "./registry.js";

export type UpdateJustOneHintProgressResult =
  | Readonly<{ status: "updated" }>
  | Readonly<{ status: "notFound" }>
  | Readonly<{ status: "progressMessageNotFound" }>;

export interface UpdateJustOneHintProgressInput {
  readonly channelId: string;
  readonly registry: JustOneDiscordSessionRegistry;
  readonly editProgressMessage: (input: {
    readonly messageId: string;
    readonly content: string;
  }) => Promise<void>;
}

export async function updateJustOneHintProgress(
  input: UpdateJustOneHintProgressInput
): Promise<UpdateJustOneHintProgressResult> {
  const session = input.registry.get(input.channelId);

  if (!session) {
    return { status: "notFound" };
  }

  const progressMessage = input.registry.getHintProgressMessage(input.channelId);

  if (!progressMessage || progressMessage.sessionId !== session.id) {
    return { status: "progressMessageNotFound" };
  }

  const progress = getHintSubmissionProgress(getJustOneState(session));

  await input.editProgressMessage({
    messageId: progressMessage.messageId,
    content: createJustOneHintProgressMessage(progress)
  });

  return { status: "updated" };
}
