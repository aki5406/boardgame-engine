import type { createItoEngine } from "@boardgame/game-ito";

export type ItoDiscordSession = ReturnType<ReturnType<typeof createItoEngine>["startSession"]>;

export interface ItoDiscordSessionRegistry {
  readonly register: (input: RegisterItoDiscordSessionInput) => void;
  readonly get: (channelId: string) => ItoDiscordSession | undefined;
  readonly delete: (channelId: string) => boolean;
  readonly has: (channelId: string) => boolean;
}

export interface RegisterItoDiscordSessionInput {
  readonly channelId: string;
  readonly session: ItoDiscordSession;
}

export function createItoDiscordSessionRegistry(): ItoDiscordSessionRegistry {
  const sessionsByChannelId = new Map<string, ItoDiscordSession>();

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
