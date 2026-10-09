import { startWordWolfDiscordAdapter } from "./standalone.js";

await startWordWolfDiscordAdapter().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to start Discord adapter";

  console.error(message);
  process.exitCode = 1;
});
