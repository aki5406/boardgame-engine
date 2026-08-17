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

export interface JustOneDiscordHintProgressMessage {
  readonly channelId: string;
  readonly sessionId: string;
  readonly messageId: string;
}

export interface JustOneDiscordDuplicateReviewThread {
  readonly threadId: string;
  readonly sessionId: string;
  readonly channelId: string;
  readonly messageId: string;
}

export interface JustOneDiscordGuessingMessage {
  readonly channelId: string;
  readonly sessionId: string;
  readonly messageId: string;
}

export interface JustOneDiscordSessionRegistry {
  readonly register: (input: RegisterJustOneDiscordSessionInput) => void;
  readonly get: (channelId: string) => JustOneDiscordSession | undefined;
  readonly delete: (channelId: string) => boolean;
  readonly has: (channelId: string) => boolean;
  readonly registerHintThread: (thread: JustOneDiscordHintThread) => void;
  readonly getHintThread: (threadId: string) => JustOneDiscordHintThread | undefined;
  readonly listHintThreadsByChannelId: (channelId: string) => readonly JustOneDiscordHintThread[];
  readonly registerHintProgressMessage: (message: JustOneDiscordHintProgressMessage) => void;
  readonly getHintProgressMessage: (
    channelId: string
  ) => JustOneDiscordHintProgressMessage | undefined;
  readonly registerDuplicateReviewThread: (thread: JustOneDiscordDuplicateReviewThread) => void;
  readonly getDuplicateReviewThread: (
    threadId: string
  ) => JustOneDiscordDuplicateReviewThread | undefined;
  readonly getDuplicateReviewThreadByChannelId: (
    channelId: string
  ) => JustOneDiscordDuplicateReviewThread | undefined;
  readonly registerGuessingMessage: (message: JustOneDiscordGuessingMessage) => void;
  readonly getGuessingMessage: (channelId: string) => JustOneDiscordGuessingMessage | undefined;
}

export interface RegisterJustOneDiscordSessionInput {
  readonly channelId: string;
  readonly session: JustOneDiscordSession;
}

export function createJustOneDiscordSessionRegistry(): JustOneDiscordSessionRegistry {
  const sessionsByChannelId = new Map<string, JustOneDiscordSession>();
  const hintThreadsByThreadId = new Map<string, JustOneDiscordHintThread>();
  const hintProgressMessagesByChannelId = new Map<string, JustOneDiscordHintProgressMessage>();
  const duplicateReviewThreadsByThreadId = new Map<string, JustOneDiscordDuplicateReviewThread>();
  const guessingMessagesByChannelId = new Map<string, JustOneDiscordGuessingMessage>();

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

      hintProgressMessagesByChannelId.delete(channelId);
      guessingMessagesByChannelId.delete(channelId);

      for (const [threadId, thread] of duplicateReviewThreadsByThreadId) {
        if (thread.channelId === channelId) {
          duplicateReviewThreadsByThreadId.delete(threadId);
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
    },

    registerHintProgressMessage(message) {
      hintProgressMessagesByChannelId.set(message.channelId, message);
    },

    getHintProgressMessage(channelId) {
      return hintProgressMessagesByChannelId.get(channelId);
    },

    registerDuplicateReviewThread(thread) {
      duplicateReviewThreadsByThreadId.set(thread.threadId, thread);
    },

    getDuplicateReviewThread(threadId) {
      return duplicateReviewThreadsByThreadId.get(threadId);
    },

    getDuplicateReviewThreadByChannelId(channelId) {
      return [...duplicateReviewThreadsByThreadId.values()].find(
        (thread) => thread.channelId === channelId
      );
    },

    registerGuessingMessage(message) {
      guessingMessagesByChannelId.set(message.channelId, message);
    },

    getGuessingMessage(channelId) {
      return guessingMessagesByChannelId.get(channelId);
    }
  };
}
