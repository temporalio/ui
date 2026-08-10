import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { createUiWorkflowCatalogAuthoring } from './ui-authoring.js';
import {
  runWorkflowCatalogCli,
  workflowCatalogCommandAliases,
  workflowCatalogHelp,
} from '../../src/lib/workflow-catalog/authoring.js';

export { workflowCatalogCommandAliases, workflowCatalogHelp };

const isReportedWorkflowCatalogCliError = (error: unknown) => {
  if (!(error instanceof Error)) return false;

  return [
    'Unknown workflow catalog command',
    'Invalid arguments for workflow catalog command',
    'Usage: workflow-catalog promote',
  ].some((prefix) => error.message.startsWith(prefix));
};

const runCatalogDevelopmentEntry = (script: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'esno', script], {
      stdio: 'inherit',
    });

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${script} exited with status ${code ?? 'unknown'}`));
    });
  });

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const arguments_ = process.argv.slice(2);

  try {
    await runWorkflowCatalogCli({
      authoring: createUiWorkflowCatalogAuthoring(),
      argv: arguments_,
      io: {
        writeError: (message) => console.error(message),
        writeOutput: (message) => console.log(message),
      },
      dev: () =>
        runCatalogDevelopmentEntry('scripts/workflow-catalog/dev-with-ui.ts'),
      worker: () =>
        runCatalogDevelopmentEntry('scripts/workflow-catalog/dev.ts'),
    });
  } catch (error) {
    if (!isReportedWorkflowCatalogCliError(error)) {
      const message = error instanceof Error ? error.message : error;
      console.error(message);
    }
    process.exitCode = 1;
  }
}
