import { readRepositoryContext } from "./context.js";
import { readPullRequestContext } from "./github.js";
import { reviewWithOpenAI } from "./openai.js";
import { appendStepSummary, buildSkippedSummary } from "./summary.js";

async function main(): Promise<void> {
  if (!process.env["OPENAI_API_KEY"]) {
    await appendStepSummary(
      buildSkippedSummary({
        reason: "missing OPENAI_API_KEY",
        detail: "BEA dry run was skipped without failing the workflow."
      })
    );
    return;
  }

  const [repository, pullRequest] = await Promise.all([
    readRepositoryContext(),
    readPullRequestContext()
  ]);

  const output = await reviewWithOpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
    model: process.env["OPENAI_MODEL"] || "gpt-5.2",
    repository,
    pullRequest
  });

  await appendStepSummary(output);
}

main().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  await appendStepSummary(
    buildSkippedSummary({
      reason: "bea dry run failed",
      detail: message
    })
  );
  process.exitCode = 1;
});
