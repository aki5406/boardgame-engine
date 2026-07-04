export interface JustOnePrivateThreadPocReply {
  readonly content: string;
  readonly authorId: string;
  readonly threadId: string;
}

export interface JustOnePrivateThreadPocEntry {
  readonly parentChannelId: string;
  readonly invitedPlayerId: string;
  readonly secretWord: string;
  readonly replies: readonly JustOnePrivateThreadPocReply[];
}

export interface TrackJustOnePrivateThreadPocInput {
  readonly threadId: string;
  readonly parentChannelId: string;
  readonly invitedPlayerId: string;
  readonly secretWord: string;
}

export interface RecordJustOnePrivateThreadPocReplyInput {
  readonly threadId: string;
  readonly content: string;
  readonly authorId: string;
}

export interface JustOnePrivateThreadPocRegistry {
  readonly track: (input: TrackJustOnePrivateThreadPocInput) => void;
  readonly get: (threadId: string) => JustOnePrivateThreadPocEntry | undefined;
  readonly recordReply: (input: RecordJustOnePrivateThreadPocReplyInput) => boolean;
}

export function createJustOnePrivateThreadPocRegistry(): JustOnePrivateThreadPocRegistry {
  const entriesByThreadId = new Map<string, JustOnePrivateThreadPocEntry>();

  return {
    track(input) {
      entriesByThreadId.set(input.threadId, {
        parentChannelId: input.parentChannelId,
        invitedPlayerId: input.invitedPlayerId,
        secretWord: input.secretWord,
        replies: []
      });
    },

    get(threadId) {
      return entriesByThreadId.get(threadId);
    },

    recordReply(input) {
      const entry = entriesByThreadId.get(input.threadId);

      if (!entry) {
        return false;
      }

      entriesByThreadId.set(input.threadId, {
        ...entry,
        replies: [
          ...entry.replies,
          {
            content: input.content,
            authorId: input.authorId,
            threadId: input.threadId
          }
        ]
      });

      return true;
    }
  };
}
