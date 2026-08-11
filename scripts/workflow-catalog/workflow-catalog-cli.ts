import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { createUiWorkflowCatalogAuthoring } from './ui-authoring.js';
import {
  runWorkflowCatalogCli,
  workflowCatalogHelp,
} from '../../src/lib/workflow-catalog/authoring.js';

export { workflowCatalogHelp };

const isReportedWorkflowCatalogCliError = (error: unknown) => {
  if (!(error instanceof Error)) return false;

  return [
    'Unknown workflow catalog command',
    'Invalid arguments for workflow catalog command',
    'Usage: workflow-catalog demote',
    'Usage: workflow-catalog promote',
  ].some((prefix) => error.message.startsWith(prefix));
};

export const workflowCatalogWorkerEntry = 'scripts/workflow-catalog/dev.ts';

/**
 * Node restarts the worker whenever a module it loaded changes, so scaffolding,
 * promoting, demoting, or editing an example reaches the running worker.
 */
export const workflowCatalogWorkerWatchArguments = [
  '--watch',
  '--watch-preserve-output',
] as const;

type CatalogDevelopmentChild = {
  once: {
    (event: 'error', listener: (error: Error) => void): unknown;
    (event: 'exit', listener: (code: number | null) => void): unknown;
  };
};

export type SpawnCatalogDevelopmentProcess = (
  command: string,
  args: readonly string[],
) => CatalogDevelopmentChild;

const spawnCatalogDevelopmentProcess: SpawnCatalogDevelopmentProcess = (
  command,
  args,
) => spawn(command, [...args], { stdio: 'inherit' });

const runCatalogDevelopmentEntry = (
  script: string,
  nodeArguments: readonly string[] = [],
  spawnProcess: SpawnCatalogDevelopmentProcess = spawnCatalogDevelopmentProcess,
) =>
  new Promise<void>((resolve, reject) => {
    const child = spawnProcess('pnpm', [
      'exec',
      'esno',
      ...nodeArguments,
      script,
    ]);

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${script} exited with status ${code ?? 'unknown'}`));
    });
  });

export const runWorkflowCatalogWorkerDevelopment = (
  spawnProcess?: SpawnCatalogDevelopmentProcess,
) =>
  runCatalogDevelopmentEntry(
    workflowCatalogWorkerEntry,
    workflowCatalogWorkerWatchArguments,
    spawnProcess,
  );

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const arguments_ = process.argv.slice(2);
  const authoring = createUiWorkflowCatalogAuthoring();

  try {
    await runWorkflowCatalogCli({
      authoring,
      argv: arguments_,
      io: {
        writeError: (message) => console.error(message),
        writeOutput: (message) => console.log(message),
      },
      dev: () =>
        runCatalogDevelopmentEntry('scripts/workflow-catalog/dev-with-ui.ts'),
      worker: async () => {
        await authoring.verify();
        await runWorkflowCatalogWorkerDevelopment();
      },
    });
  } catch (error) {
    if (!isReportedWorkflowCatalogCliError(error)) {
      const message = error instanceof Error ? error.message : error;
      console.error(message);
    }
    process.exitCode = 1;
  }
}
