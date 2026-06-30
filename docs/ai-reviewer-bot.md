# AI Reviewer Bot Design Notes

This document records the initial design for a future AI reviewer bot.

The goal is to prepare for automated PR review assistance without adding a workflow, OpenAI API client, npm package, or bot implementation yet.

## Goals

- Run on pull requests in the future.
- Read the PR diff and project review policy.
- Post review comments that help human reviewers.
- Keep approval and request-changes decisions human-owned.

## Non Goals

- Do not add a GitHub Actions workflow in this PR.
- Do not call the OpenAI API in this PR.
- Do not add npm packages.
- Do not change Engine API or application code.
- Do not auto-approve PRs.
- Do not auto-request changes.
- Do not merge PRs.

## Expected GitHub Actions Trigger

The future workflow will likely use `pull_request`.

Possible trigger shape:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
```

The first implementation should avoid `pull_request_target` unless there is a specific, reviewed security reason. `pull_request_target` can expose secrets to untrusted fork code if used incorrectly.

## Expected Inputs

The reviewer should gather enough context to evaluate the PR against repository policy.

Required inputs:

- PR diff
- PR title and body
- Changed file list
- `AGENTS.md`
- `docs/review-guidelines.md`
- ADRs under `docs/decisions`

Optional inputs:

- Relevant README files
- Existing tests near changed files
- CI check results
- Recent review comments, if rerunning after feedback

## Review Behavior

The first bot version should only post review comments.

It should:

- Summarize the PR.
- Identify concrete findings.
- Ask clarifying questions when the design is ambiguous.
- Suggest follow-up issues when something is important but out of scope.
- Mention when no issues were found.

It should not:

- Submit an approval.
- Submit `Request Changes`.
- Resolve review threads.
- Edit code.
- Push commits.
- Change labels.
- Merge PRs.

Human reviewers remain responsible for final decisions.

## OpenAI API Integration Idea

A future implementation can use the OpenAI API from a GitHub Actions job.

High-level flow:

1. Checkout repository.
2. Collect PR metadata and diff using GitHub API or `gh`.
3. Read `AGENTS.md`, `docs/review-guidelines.md`, and `docs/decisions/*`.
4. Build a review prompt from repository policy and PR context.
5. Call the OpenAI API.
6. Convert the response into a GitHub review comment.
7. Post the comment without approval or request-changes state.

The model should be instructed to follow repository guidelines, be concise, cite file paths when possible, and avoid inventing changed code that is not in the diff.

## Secrets

The future workflow can expect an `OPENAI_API_KEY` secret in GitHub Actions.

Recommended secret usage:

- Store the key in repository or organization secrets.
- Pass it only to the step that calls the OpenAI API.
- Do not echo it.
- Do not include it in logs, comments, artifacts, or prompts.
- Avoid running secret-bearing steps for untrusted fork PRs until the security model is reviewed.

## Security Notes

### Pull Request Trust Boundary

PR contents are untrusted input.

The bot must not execute arbitrary code from the PR just to produce a review. Reading files and diffs is safer than running changed scripts.

### `pull_request_target`

Avoid `pull_request_target` for the first version.

If it is ever needed, the workflow must not checkout or execute untrusted head code with write tokens or secrets available.

### Token Permissions

Use the smallest possible GitHub token permissions.

Likely permissions for posting comments:

```yaml
permissions:
  contents: read
  pull-requests: write
```

If the bot only reports through job summary at first, `pull-requests: write` may not be necessary.

### Prompt Injection

PR diffs, PR bodies, and repository files can contain prompt-injection attempts.

The bot prompt should state that repository policy and system instructions outrank PR-provided text. PR content should be treated as data to review, not instructions to follow.

### Data Exposure

The bot should avoid sending unnecessary repository content to external APIs.

Prefer:

- PR diff
- Relevant changed files
- Review policy docs
- ADRs

Avoid:

- Secrets
- `.env` files
- Large unrelated files
- Build artifacts
- Dependency directories

### Comment Safety

The bot should not post sensitive data.

It should avoid quoting long file contents, generated artifacts, or dependency code. It should prefer short snippets, file references, and summaries.

## Initial Rollout Plan

1. Add review policy and bot design docs.
2. Add a dry-run workflow that writes review output to the GitHub Actions job summary.
3. Keep the dry run read-only: use `pull_request`, `contents: read`, and `pull-requests: read`.
4. Skip successfully when `OPENAI_API_KEY` is unavailable, such as fork PRs where secrets are not exposed.
5. Add PR comment posting only after the dry-run output is useful.
6. Keep approve/request-changes disabled.
7. Evaluate comment quality over several real PRs.
8. Consider required checks or stronger automation only after human reviewers trust the output.

## Current Dry Run Workflow

The repository includes a BEA dry-run workflow at `.github/workflows/bea-review.yml`.

Current behavior:

- Triggered by `pull_request` events: `opened`, `synchronize`, `reopened`, and `ready_for_review`.
- Uses read-only GitHub token permissions: `contents: read` and `pull-requests: read`.
- Runs `pnpm bea:review`.
- Reads PR body, PR diff, changed files, `AGENTS.md`, review docs, BEA playbook, and accepted ADRs.
- Does not call the OpenAI Responses API unless `BEA_REVIEW_OPENAI_ENABLED=true` is set as a repository variable.
- Calls the OpenAI Responses API only when API-backed review is enabled and `OPENAI_API_KEY` is available.
- Writes BEA output to the GitHub Actions job summary.
- Does not post PR comments.
- Does not approve, request changes, merge, label, or create inline review comments.

The dry run is intentionally non-blocking from a review-authority perspective. Humans still decide whether a PR needs changes and whether it can merge.

## Open Questions

- Should the first bot output be a single PR comment or a GitHub Actions summary?
- Should reruns update an existing bot comment or post a new one?
- Which model should be used for review quality and cost balance?
- How much repository context should be included by default?
- Should docs-only PRs use a lighter review prompt?
- Should bot comments include severity labels such as `blocking-risk`, `follow-up`, `question`, and `nit`?
