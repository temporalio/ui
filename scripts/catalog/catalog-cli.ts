import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

import { getProjectRoot } from '../get-project-root.js';
import { migrateLegacyCatalogLocalState } from './local-migration.js';
import { createUiCatalogAuthoring } from './ui-authoring.js';
import { catalogHelp, runCatalogCli } from '../../src/lib/catalog/authoring.js';

export { catalogHelp };

const isReportedCatalogCliError = (error: unknown) => {
  if (!(error instanceof Error)) return false;

  return [
    'Unknown catalog command',
    'Invalid arguments for catalog command',
    'Usage: catalog demote',
    'Usage: catalog list',
    'Usage: catalog promote',
  ].some((prefix) => error.message.startsWith(prefix));
};

export const catalogWorkerEntry = 'scripts/catalog/dev.ts';

/**
 * Node restarts the worker whenever a module it loaded changes, so scaffolding,
 * promoting, demoting, or editing an example reaches the running worker.
 */
export const catalogWorkerWatchArguments = [
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

export const runCatalogWorkerDevelopment = (
  spawnProcess?: SpawnCatalogDevelopmentProcess,
) =>
  runCatalogDevelopmentEntry(
    catalogWorkerEntry,
    catalogWorkerWatchArguments,
    spawnProcess,
  );

export const prepareCatalogCommand = async ({
  rootDirectory = getProjectRoot(),
  migrate = migrateLegacyCatalogLocalState,
  createAuthoring = createUiCatalogAuthoring,
}: {
  rootDirectory?: string;
  migrate?: typeof migrateLegacyCatalogLocalState;
  createAuthoring?: typeof createUiCatalogAuthoring;
} = {}) => {
  await migrate(rootDirectory);
  return createAuthoring(rootDirectory);
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const arguments_ = process.argv.slice(2);

  try {
    const authoring = await prepareCatalogCommand();
    await runCatalogCli({
      authoring,
      argv: arguments_,
      io: {
        writeError: (message) => console.error(message),
        writeOutput: (message) => console.log(message),
      },
      dev: () => runCatalogDevelopmentEntry('scripts/catalog/dev-with-ui.ts'),
      worker: async () => {
        await authoring.verify();
        await runCatalogWorkerDevelopment();
      },
    });
  } catch (error) {
    if (!isReportedCatalogCliError(error)) {
      const message = error instanceof Error ? error.message : error;
      console.error(message);
    }
    process.exitCode = 1;
  }
}
