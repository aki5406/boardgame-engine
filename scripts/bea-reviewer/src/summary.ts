import { appendFile } from "node:fs/promises";

export async function appendStepSummary(markdown: string): Promise<void> {
  const summaryPath = process.env["GITHUB_STEP_SUMMARY"];

  if (!summaryPath) {
    console.log(markdown);
    return;
  }

  await appendFile(summaryPath, `${markdown.trim()}\n`, "utf8");
}

export function buildSkippedSummary(input: {
  readonly reason: string;
  readonly detail: string;
}): string {
  return ["# BEA Review Dry Run", "", `skipped: ${input.reason}`, "", input.detail].join("\n");
}
