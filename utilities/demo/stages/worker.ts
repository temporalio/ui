import { readFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';

import { chalk } from 'zx';

import type { WorkerDefinition } from '../definition';
import { type Logger, runDirFor } from '../paths';
import { startDetached, type Supervised } from '../process';

export type RunningWorker = {
  process?: Supervised;
  targets: string[];
  reusedExisting: boolean;
};

const READY_EVENT = '"event":"target-running"';

const runningTargets = (logFile: string): string[] => {
  try {
    return [
      ...new Set(
        readFileSync(logFile, 'utf8')
          .split('\n')
          .filter((line) => line.includes(READY_EVENT))
          .flatMap((line) => {
            try {
              const parsed = JSON.parse(line) as { targetId?: string };

              return parsed.targetId ? [parsed.targetId] : [];
            } catch {
              return [];
            }
          }),
      ),
    ];
  } catch {
    return [];
  }
};

const waitForTargets = async (logFile: string, timeoutMs: number) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const targets = runningTargets(logFile);

    if (targets.length) return targets;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return [];
};

/**
 * Starts the catalog's own worker rather than a worker of our own, so a demo
 * runs the same code the catalog page runs. The worker takes its address and
 * namespace from the environment, which wins over `.env.catalog`, so it follows
 * whichever server the server stage provisioned.
 */
export const startCatalogWorker = async (
  worker: WorkerDefinition,
  address: string,
  namespace: string,
  log: Logger,
  runName: string,
): Promise<RunningWorker> => {
  const directory = runDirFor(runName);

  await mkdir(directory, { recursive: true });

  const logFile = join(directory, 'catalog-worker.log');

  log(
    `Starting the catalog worker against ${address}, namespace "${namespace}"`,
  );

  const child = startDetached('catalog-worker', 'pnpm', ['catalog', 'worker'], {
    env: {
      ...process.env,
      TEMPORAL_ADDRESS: address,
      TEMPORAL_NAMESPACE: namespace,
      ...(worker.targetId ? { CATALOG_TARGET_ID: worker.targetId } : {}),
    },
    logFile,
  });

  const targets = await waitForTargets(logFile, worker.readyTimeoutMs);

  if (!targets.length) {
    await child.stop();

    throw new Error(
      [
        'The catalog worker did not report a running target.',
        `Its log is at ${logFile}.`,
        'Run "pnpm catalog verify" if the generated artifacts may be stale.',
      ].join('\n'),
    );
  }

  log(
    chalk.dim(
      `Catalog worker polling for ${targets.length} target(s): ${targets.join(', ')}`,
    ),
  );

  return { process: child, targets, reusedExisting: false };
};
