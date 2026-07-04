import { getJustOneState } from "./state.js";
import type { JustOneDiscordSession } from "./registry.js";
import {
  createJustOneGuesserRoleMessage,
  createJustOneHintPlayerRoleMessage
} from "../views/just-one-start.js";

export interface SendJustOneDirectMessageInput {
  readonly playerId: string;
  readonly message: string;
}

export interface DeliverJustOneRolesInput {
  readonly session: JustOneDiscordSession;
  readonly sendDirectMessage: (input: SendJustOneDirectMessageInput) => Promise<void>;
}

export async function deliverJustOneRoles(input: DeliverJustOneRolesInput): Promise<void> {
  const state = getJustOneState(input.session);

  if (!state.guesserId || !state.secretWord) {
    throw new Error("Cannot deliver Just One roles before the game has started");
  }

  for (const player of input.session.players) {
    const message =
      player.id === state.guesserId
        ? createJustOneGuesserRoleMessage()
        : createJustOneHintPlayerRoleMessage(state.secretWord);

    await input.sendDirectMessage({
      playerId: player.id,
      message
    });
  }
}
