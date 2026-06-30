import { readRepositoryContext } from "./context.js";
import { readPullRequestContext } from "./github.js";
import { reviewWithOpenAI } from "./openai.js";
import { appendStepSummary, buildFailedSummary, buildSkippedSummary } from "./summary.js";

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

  const model = process.env["OPENAI_MODEL"] || "gpt-5.1";
  const output = await reviewWithOpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
    model,
    repository,
    pullRequest
  });

  await appendStepSummary(output);
}

main().catch(async (error: unknown) => {
  const message = sanitizeErrorMessage(error instanceof Error ? error.message : String(error));
  console.error(`BEA dry run failed: ${message}`);
  await appendStepSummary(buildFailedSummary({ detail: message }));
  process.exitCode = 1;
});

function sanitizeErrorMessage(message: string): string {
  return message.replace(/sk-[A-Za-z0-9_-]+/g, "sk-***");
}
