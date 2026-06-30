import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export interface RepositoryContext {
  readonly agents: string;
  readonly reviewGuidelines: string;
  readonly aiReviewerBot: string;
  readonly aiReviewPlaybook: string;
  readonly adrs: readonly DocumentContext[];
}

export interface DocumentContext {
  readonly path: string;
  readonly content: string;
}

export async function readRepositoryContext(): Promise<RepositoryContext> {
  return {
    agents: await readTextFile("AGENTS.md"),
    reviewGuidelines: await readTextFile("docs/review-guidelines.md"),
    aiReviewerBot: await readTextFile("docs/ai-reviewer-bot.md"),
    aiReviewPlaybook: await readTextFile("docs/ai-review-playbook.md"),
    adrs: await readAdrDocuments("docs/decisions")
  };
}

async function readAdrDocuments(directory: string): Promise<readonly DocumentContext[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(directory, entry.name))
    .sort();

  return Promise.all(
    markdownFiles.map(async (path) => ({
      path,
      content: await readTextFile(path)
    }))
  );
}

async function readTextFile(path: string): Promise<string> {
  return readFile(path, "utf8");
}
