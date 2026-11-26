import { spawn } from 'node:child_process';
import { existsSync, watch } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

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

type CatalogDevelopmentChild = {
  once: {
    (event: 'error', listener: (error: Error) => void): unknown;
    (event: 'exit', listener: (code: number | null) => void): unknown;
  };
};

const runCatalogDevelopmentEntry = (script: string) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'esno', script], { stdio: 'inherit' });

    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolve();
      else
        reject(new Error(`${script} exited with status ${code ?? 'unknown'}`));
    });
  });

export type CatalogWorkerProcess = CatalogDevelopmentChild & {
  kill: (signal: NodeJS.Signals) => unknown;
};

export type SpawnCatalogWorkerProcess = (
  command: string,
  args: readonly string[],
) => CatalogWorkerProcess;

export type WatchCatalogSources = (
  paths: readonly string[],
  onChange: (filename: string) => void,
) => () => void;

type CatalogSignals = {
  on: (signal: 'SIGINT' | 'SIGTERM', listener: () => void) => unknown;
  off: (signal: 'SIGINT' | 'SIGTERM', listener: () => void) => unknown;
};

export const catalogWatchedSourcePaths = [
  'src/lib/catalog',
  'scripts/catalog',
  'catalog.local',
] as const;

export const isCatalogSourceChange = (filename: string) =>
  /\.(?:[cm]?[jt]s|json)$/.test(filename) &&
  !/(?:^|[\\/])node_modules[\\/]/.test(filename);

const spawnCatalogWorkerProcess: SpawnCatalogWorkerProcess = (
  command,
  args,
) => {
  const child = spawn(command, [...args], { stdio: 'inherit', detached: true });

  return {
    once: (event: 'error' | 'exit', listener: (value: never) => void) =>
      child.once(event, listener),
    kill: (signal) => {
      if (!child.pid) return;
      try {
        process.kill(-child.pid, signal);
      } catch {
        child.kill(signal);
      }
    },
  } as CatalogWorkerProcess;
};

const watchCatalogSources: WatchCatalogSources = (paths, onChange) => {
  const watchers = paths
    .filter((path) => existsSync(path))
    .map((path) =>
      watch(path, { recursive: true }, (_event, filename) => {
        if (filename) onChange(filename);
      }),
    );

  return () => {
    for (const watcher of watchers) watcher.close();
  };
};

/**
 * Restarts the worker after a crash exit and when a catalog source changes, so
 * crash demos recover and scaffolding, promoting, demoting, or editing an
 * example reaches the running worker. Node's --watch cannot restart a process
 * that exits, so the command watches the sources itself.
 */
export const runCatalogWorkerDevelopment = ({
  rootDirectory = getProjectRoot(),
  log = console.info,
  spawnWorker = spawnCatalogWorkerProcess,
  watchSources = watchCatalogSources,
  signals = process,
  debounceMs = 200,
}: {
  rootDirectory?: string;
  log?: (message: string) => void;
  spawnWorker?: SpawnCatalogWorkerProcess;
  watchSources?: WatchCatalogSources;
  signals?: CatalogSignals;
  debounceMs?: number;
} = {}) =>
  new Promise<void>((resolve, reject) => {
    let child: CatalogWorkerProcess | undefined;
    let restarting = false;
    let stopping = false;
    let pendingRestart: ReturnType<typeof setTimeout> | undefined;

    const finish = (error?: Error) => {
      clearTimeout(pendingRestart);
      stopWatching();
      signals.off('SIGINT', forwardInterrupt);
      signals.off('SIGTERM', forwardTerminate);
      if (error) reject(error);
      else resolve();
    };

    const start = () => {
      const worker = spawnWorker('pnpm', ['exec', 'esno', catalogWorkerEntry]);
      child = worker;

      worker.once('error', (error) => finish(error));
      worker.once('exit', (code) => {
        child = undefined;
        if (stopping) {
          finish();
          return;
        }
        if (restarting) {
          restarting = false;
          start();
          return;
        }
        if (code === catalogCrashExitCode) {
          log('Catalog worker crashed on request. Restarting it.');
          start();
          return;
        }
        if (code === 0 || code === null) {
          finish();
          return;
        }
        finish(
          new Error(
            `${catalogWorkerEntry} exited with status ${code ?? 'unknown'}`,
          ),
        );
      });
    };

    const restartForChange = (filename: string) => {
      if (stopping || !isCatalogSourceChange(filename)) return;

      clearTimeout(pendingRestart);
      pendingRestart = setTimeout(() => {
        if (stopping || restarting || !child) return;
        log(`Catalog source changed (${filename}). Restarting the worker.`);
        restarting = true;
        child.kill('SIGTERM');
      }, debounceMs);
    };

    const forward = (signal: 'SIGINT' | 'SIGTERM') => {
      stopping = true;
      clearTimeout(pendingRestart);
      if (child) child.kill(signal);
      else finish();
    };
    const forwardInterrupt = () => forward('SIGINT');
    const forwardTerminate = () => forward('SIGTERM');

    const stopWatching = watchSources(
      catalogWatchedSourcePaths.map((path) => join(rootDirectory, path)),
      restartForChange,
    );
    signals.on('SIGINT', forwardInterrupt);
    signals.on('SIGTERM', forwardTerminate);

    log('The worker restarts after a crash or a source change.');
    start();
  });

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
