import { createRequire } from 'node:module';
import { Worker } from '@temporalio/worker';

import * as activities from './activities/index';
import { getDataConverter } from './data-converter';

const require = createRequire(import.meta.url);

let worker: Worker;

const createWorker = async (): Promise<Worker> => {
  return Worker.create({
    dataConverter: getDataConverter(),
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'e2e-1',
  });
};

const workerIsRunning = () => {
  return worker.getState() === 'RUNNING';
};

export const runWorker = async (): Promise<void> => {
  worker = await createWorker();

  worker.run();

  return new Promise<void>((resolve) => {
    (function waitForWorkerToBeRunning() {
      if (workerIsRunning()) return resolve();
      setTimeout(waitForWorkerToBeRunning, 100);
    })();
  });
};

export const runWorkerUntil = async (completed: Promise<unknown>) => {
  worker = await createWorker();

  return worker.runUntil(completed);
};

export const stopWorker = async () => {
  if (worker && workerIsRunning()) {
    worker.shutdown();
  }
};
