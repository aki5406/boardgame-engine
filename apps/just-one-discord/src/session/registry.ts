import type { createJustOneEngine } from "@boardgame/game-just-one";

export type JustOneDiscordSession = ReturnType<
  ReturnType<typeof createJustOneEngine>["startSession"]
>;

export interface JustOneDiscordSessionRegistry {
  readonly register: (input: RegisterJustOneDiscordSessionInput) => void;
  readonly get: (channelId: string) => JustOneDiscordSession | undefined;
  readonly delete: (channelId: string) => boolean;
  readonly has: (channelId: string) => boolean;
}

export interface RegisterJustOneDiscordSessionInput {
  readonly channelId: string;
  readonly session: JustOneDiscordSession;
}

export function createJustOneDiscordSessionRegistry(): JustOneDiscordSessionRegistry {
  const sessionsByChannelId = new Map<string, JustOneDiscordSession>();

  return {
    register(input) {
      sessionsByChannelId.set(input.channelId, input.session);
    },

    get(channelId) {
      return sessionsByChannelId.get(channelId);
    },

    delete(channelId) {
      return sessionsByChannelId.delete(channelId);
    },

    has(channelId) {
      return sessionsByChannelId.has(channelId);
    }
  };
}
