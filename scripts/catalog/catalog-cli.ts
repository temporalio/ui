import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseEnv } from 'node:util';

import { getProjectRoot } from '../get-project-root.js';
import { migrateLegacyCatalogLocalState } from './local-migration.js';
import { createUiCatalogAuthoring } from './ui-authoring.js';
import { catalogHelp, runCatalogCli } from '../../src/lib/catalog/authoring.js';
import { catalogCrashExitCode } from '../../src/lib/catalog/worker/crash.js';

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

const readEnvironmentFile = (path: string) => {
  try {
    return parseEnv(readFileSync(path, 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
};

export const catalogControlSetting = (
  rootDirectory: string,
  environment: Readonly<Record<string, string | undefined>> = process.env,
) =>
  environment.CATALOG_CONTROL ??
  readEnvironmentFile(join(rootDirectory, '.env.catalog.local'))
    .CATALOG_CONTROL ??
  readEnvironmentFile(join(rootDirectory, '.env.catalog')).CATALOG_CONTROL;

const runCrashableCatalogWorker = (
  spawnProcess: SpawnCatalogDevelopmentProcess,
  log: (message: string) => void,
) =>
  new Promise<void>((resolve, reject) => {
    const start = () => {
      const child = spawnProcess('pnpm', ['exec', 'esno', catalogWorkerEntry]);

      child.once('error', reject);
      child.once('exit', (code) => {
        if (code === catalogCrashExitCode) {
          log('Catalog worker crashed on request. Restarting it.');
          start();
          return;
        }
        if (code === 0 || code === null) resolve();
        else
          reject(
            new Error(
              `${catalogWorkerEntry} exited with status ${code ?? 'unknown'}`,
            ),
          );
      });
    };

    log(
      'Crash control is on: the worker restarts after a crash, and file watching is off.',
    );
    start();
  });

export const runCatalogWorkerDevelopment = (
  spawnProcess: SpawnCatalogDevelopmentProcess = spawnCatalogDevelopmentProcess,
  {
    rootDirectory = getProjectRoot(),
    environment = process.env,
    log = console.info,
  }: {
    rootDirectory?: string;
    environment?: Readonly<Record<string, string | undefined>>;
    log?: (message: string) => void;
  } = {},
) =>
  catalogControlSetting(rootDirectory, environment) === 'on'
    ? runCrashableCatalogWorker(spawnProcess, log)
    : runCatalogDevelopmentEntry(
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
