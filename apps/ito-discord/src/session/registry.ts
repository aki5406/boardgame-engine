import type { createItoEngine } from "@boardgame/game-ito";

export type ItoDiscordSession = ReturnType<ReturnType<typeof createItoEngine>["startSession"]>;

export interface ItoDiscordAnswerTracking {
  readonly answerThreadId: string;
  readonly answerStatusMessageId: string;
  readonly answeredPlayerIds: readonly string[];
  readonly answersByPlayerId: Readonly<Record<string, string>>;
}

export interface ItoDiscordSessionRegistry {
  readonly register: (input: RegisterItoDiscordSessionInput) => void;
  readonly get: (channelId: string) => ItoDiscordSession | undefined;
  readonly delete: (channelId: string) => boolean;
  readonly has: (channelId: string) => boolean;
  readonly setAnswerTracking: (input: SetItoDiscordAnswerTrackingInput) => void;
  readonly getAnswerTracking: (channelId: string) => ItoDiscordAnswerTracking | undefined;
  readonly findChannelIdByAnswerThreadId: (answerThreadId: string) => string | undefined;
  readonly recordPlayerAnswer: (input: RecordItoDiscordPlayerAnswerInput) => boolean;
}

export interface RegisterItoDiscordSessionInput {
  readonly channelId: string;
  readonly session: ItoDiscordSession;
}

export interface SetItoDiscordAnswerTrackingInput {
  readonly channelId: string;
  readonly answerTracking: ItoDiscordAnswerTracking;
}

export interface RecordItoDiscordPlayerAnswerInput {
  readonly channelId: string;
  readonly playerId: string;
  readonly answer: string;
}

export function createItoDiscordSessionRegistry(): ItoDiscordSessionRegistry {
  const sessionsByChannelId = new Map<string, ItoDiscordSession>();
  const answerTrackingByChannelId = new Map<string, ItoDiscordAnswerTracking>();
  const channelIdByAnswerThreadId = new Map<string, string>();

  return {
    register(input) {
      sessionsByChannelId.set(input.channelId, input.session);
    },

    get(channelId) {
      return sessionsByChannelId.get(channelId);
    },

    delete(channelId) {
      const answerTracking = answerTrackingByChannelId.get(channelId);

      if (answerTracking) {
        channelIdByAnswerThreadId.delete(answerTracking.answerThreadId);
        answerTrackingByChannelId.delete(channelId);
      }

      return sessionsByChannelId.delete(channelId);
    },

    has(channelId) {
      return sessionsByChannelId.has(channelId);
    },

    setAnswerTracking(input) {
      const previousAnswerTracking = answerTrackingByChannelId.get(input.channelId);

      if (previousAnswerTracking) {
        channelIdByAnswerThreadId.delete(previousAnswerTracking.answerThreadId);
      }

      answerTrackingByChannelId.set(input.channelId, input.answerTracking);
      channelIdByAnswerThreadId.set(input.answerTracking.answerThreadId, input.channelId);
    },

    getAnswerTracking(channelId) {
      return answerTrackingByChannelId.get(channelId);
    },

    findChannelIdByAnswerThreadId(answerThreadId) {
      return channelIdByAnswerThreadId.get(answerThreadId);
    },

    recordPlayerAnswer(input) {
      const answerTracking = answerTrackingByChannelId.get(input.channelId);

      if (!answerTracking) {
        return false;
      }

      const hasAnswered = answerTracking.answeredPlayerIds.includes(input.playerId);

      answerTrackingByChannelId.set(input.channelId, {
        ...answerTracking,
        answeredPlayerIds: hasAnswered
          ? answerTracking.answeredPlayerIds
          : [...answerTracking.answeredPlayerIds, input.playerId],
        answersByPlayerId: {
          ...answerTracking.answersByPlayerId,
          [input.playerId]: input.answer
        }
      });

      return !hasAnswered;
    }
  };
}
