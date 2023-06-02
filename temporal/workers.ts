import { createRequire } from 'node:module';
import { Worker } from '@temporalio/worker';

import * as activities from './activities/index';
import { defaultDataConverter } from '@temporalio/common';

const require = createRequire(import.meta.url);

let worker: Worker;

const createWorker = async (): Promise<void> => {
  if (!worker) {
    worker = await Worker.create({
      dataConverter: defaultDataConverter,
      workflowsPath: require.resolve('./workflows'),
      activities,
      taskQueue: 'e2e-1',
    });
  }
};

export const runWorker = async () => {
  await createWorker();

  return worker.run();
};

export const runWorkerUntil = async (completed: Promise<unknown>) => {
  await createWorker();

  return worker.runUntil(completed);
};

export const stopWorker = async () => {
  if (worker.getState() === 'RUNNING') {
    worker.shutdown();
  }
};
