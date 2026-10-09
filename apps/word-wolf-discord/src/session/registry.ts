import type { createWordWolfEngine } from "@boardgame/game-word-wolf";

export type WordWolfDiscordSession = ReturnType<
  ReturnType<typeof createWordWolfEngine>["startSession"]
>;

export interface WordWolfDiscordPrivateWordThread {
  readonly threadId: string;
  readonly sessionId: string;
  readonly channelId: string;
  readonly playerId: string;
}

export interface WordWolfDiscordSessionRegistry {
  readonly register: (input: RegisterWordWolfDiscordSessionInput) => void;
  readonly get: (channelId: string) => WordWolfDiscordSession | undefined;
  readonly has: (channelId: string) => boolean;
  readonly registerPrivateWordThread: (thread: WordWolfDiscordPrivateWordThread) => void;
  readonly listPrivateWordThreadsByChannelId: (
    channelId: string
  ) => readonly WordWolfDiscordPrivateWordThread[];
}

export interface RegisterWordWolfDiscordSessionInput {
  readonly channelId: string;
  readonly session: WordWolfDiscordSession;
}

export function createWordWolfDiscordSessionRegistry(): WordWolfDiscordSessionRegistry {
  const sessionsByChannelId = new Map<string, WordWolfDiscordSession>();
  const privateWordThreadsByThreadId = new Map<string, WordWolfDiscordPrivateWordThread>();

  return {
    register(input) {
      sessionsByChannelId.set(input.channelId, input.session);
    },

    get(channelId) {
      return sessionsByChannelId.get(channelId);
    },

    has(channelId) {
      return sessionsByChannelId.has(channelId);
    },

    registerPrivateWordThread(thread) {
      privateWordThreadsByThreadId.set(thread.threadId, thread);
    },

    listPrivateWordThreadsByChannelId(channelId) {
      return [...privateWordThreadsByThreadId.values()].filter(
        (thread) => thread.channelId === channelId
      );
    }
  };
}
