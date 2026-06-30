import { readFile } from "node:fs/promises";

export interface PullRequestContext {
  readonly owner: string;
  readonly repo: string;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly diff: string;
  readonly changedFiles: readonly ChangedFile[];
}

export interface ChangedFile {
  readonly filename: string;
  readonly status: string;
  readonly additions: number;
  readonly deletions: number;
}

interface GitHubEvent {
  readonly repository?: {
    readonly name?: string;
    readonly owner?: {
      readonly login?: string;
    };
  };
  readonly pull_request?: {
    readonly number?: number;
    readonly title?: string;
    readonly body?: string | null;
  };
}

export async function readPullRequestContext(): Promise<PullRequestContext> {
  const event = await readGitHubEvent();
  const token = requireEnv("GITHUB_TOKEN");
  const owner = requireValue(event.repository?.owner?.login, "repository.owner.login");
  const repo = requireValue(event.repository?.name, "repository.name");
  const number = requireValue(event.pull_request?.number, "pull_request.number");
  const title = requireValue(event.pull_request?.title, "pull_request.title");
  const body = event.pull_request?.body ?? "";

  return {
    owner,
    repo,
    number,
    title,
    body,
    diff: await fetchPullRequestDiff({ token, owner, repo, number }),
    changedFiles: await fetchChangedFiles({ token, owner, repo, number })
  };
}

async function readGitHubEvent(): Promise<GitHubEvent> {
  const eventPath = requireEnv("GITHUB_EVENT_PATH");
  const raw = await readFile(eventPath, "utf8");
  return JSON.parse(raw) as GitHubEvent;
}

async function fetchPullRequestDiff(input: {
  readonly token: string;
  readonly owner: string;
  readonly repo: string;
  readonly number: number;
}): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${input.owner}/${input.repo}/pulls/${input.number}`,
    {
      headers: {
        Accept: "application/vnd.github.v3.diff",
        Authorization: `Bearer ${input.token}`,
        "User-Agent": "boardgame-engine-bea-reviewer"
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch PR diff: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function fetchChangedFiles(input: {
  readonly token: string;
  readonly owner: string;
  readonly repo: string;
  readonly number: number;
}): Promise<readonly ChangedFile[]> {
  const files: ChangedFile[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${input.owner}/${input.repo}/pulls/${input.number}/files?per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${input.token}`,
          "User-Agent": "boardgame-engine-bea-reviewer",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch PR files: ${response.status} ${response.statusText}`);
    }

    const pageFiles = (await response.json()) as ChangedFile[];
    files.push(...pageFiles);

    if (pageFiles.length < 100) {
      return files;
    }

    page += 1;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requireValue<T>(value: T | undefined, name: string): T {
  if (value === undefined) {
    throw new Error(`Missing required GitHub event field: ${name}`);
  }

  return value;
}
