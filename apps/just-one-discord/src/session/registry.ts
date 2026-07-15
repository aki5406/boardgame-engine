import type { createJustOneEngine } from "@boardgame/game-just-one";

export type JustOneDiscordSession = ReturnType<
  ReturnType<typeof createJustOneEngine>["startSession"]
>;

export interface JustOneDiscordHintThread {
  readonly threadId: string;
  readonly sessionId: string;
  readonly channelId: string;
  readonly playerId: string;
}

export interface JustOneDiscordSessionRegistry {
  readonly register: (input: RegisterJustOneDiscordSessionInput) => void;
  readonly get: (channelId: string) => JustOneDiscordSession | undefined;
  readonly delete: (channelId: string) => boolean;
  readonly has: (channelId: string) => boolean;
  readonly registerHintThread: (thread: JustOneDiscordHintThread) => void;
  readonly getHintThread: (threadId: string) => JustOneDiscordHintThread | undefined;
  readonly listHintThreadsByChannelId: (channelId: string) => readonly JustOneDiscordHintThread[];
}

export interface RegisterJustOneDiscordSessionInput {
  readonly channelId: string;
  readonly session: JustOneDiscordSession;
}

export function createJustOneDiscordSessionRegistry(): JustOneDiscordSessionRegistry {
  const sessionsByChannelId = new Map<string, JustOneDiscordSession>();
  const hintThreadsByThreadId = new Map<string, JustOneDiscordHintThread>();

  return {
    register(input) {
      sessionsByChannelId.set(input.channelId, input.session);
    },

    get(channelId) {
      return sessionsByChannelId.get(channelId);
    },

    delete(channelId) {
      for (const [threadId, thread] of hintThreadsByThreadId) {
        if (thread.channelId === channelId) {
          hintThreadsByThreadId.delete(threadId);
        }
      }

      return sessionsByChannelId.delete(channelId);
    },

    has(channelId) {
      return sessionsByChannelId.has(channelId);
    },

    registerHintThread(thread) {
      hintThreadsByThreadId.set(thread.threadId, thread);
    },

    getHintThread(threadId) {
      return hintThreadsByThreadId.get(threadId);
    },

    listHintThreadsByChannelId(channelId) {
      return [...hintThreadsByThreadId.values()].filter((thread) => thread.channelId === channelId);
    }
  };
}
