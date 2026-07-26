import type { HintSubmissionProgress } from "@boardgame/game-just-one";

export function createJustOneHintProgressMessage(progress: HintSubmissionProgress): string {
  return `Hint progress: ${progress.submittedCount} / ${progress.totalCount} submitted`;
}
