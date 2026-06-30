import { readRepositoryContext } from "./context.js";
import { readPullRequestContext } from "./github.js";
import { reviewWithOpenAI } from "./openai.js";
import { appendStepSummary, buildSkippedSummary } from "./summary.js";

async function main(): Promise<void> {
  if (process.env["BEA_REVIEW_OPENAI_ENABLED"] !== "true") {
    await appendStepSummary(
      buildSkippedSummary({
        reason: "OpenAI API request disabled",
        detail:
          "BEA dry run did not call the OpenAI API. Set `BEA_REVIEW_OPENAI_ENABLED=true` as a repository variable to enable API-backed review."
      })
    );
    return;
  }

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
  }).catch((error: unknown) =>
    buildSkippedSummary({
      reason: "OpenAI API request failed",
      detail: buildOpenAIErrorDetail(error, model)
    })
  );

  await appendStepSummary(output);
}

main().catch(async (error: unknown) => {
  const message = sanitizeErrorMessage(error instanceof Error ? error.message : String(error));
  await appendStepSummary(
    buildSkippedSummary({
      reason: "bea dry run failed",
      detail: message
    })
  );
  process.exitCode = 1;
});

function buildOpenAIErrorDetail(error: unknown, model: string): string {
  const message = sanitizeErrorMessage(error instanceof Error ? error.message : String(error));

  return [
    `BEA dry run could not complete with model \`${model}\`.`,
    "",
    "The workflow did not post PR comments, approve, request changes, or merge.",
    "",
    "Sanitized error:",
    "",
    "```text",
    message,
    "```"
  ].join("\n");
}

function sanitizeErrorMessage(message: string): string {
  return message.replace(/sk-[A-Za-z0-9_-]+/g, "sk-***");
}
