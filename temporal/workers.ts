import { createRequire } from 'node:module';
import { Worker } from '@temporalio/worker';

import * as activities from './activities/index';
import { defaultDataConverter } from '@temporalio/common';

const require = createRequire(import.meta.url);

let worker: Worker;

const createWorker = async (): Promise<Worker> => {
  return Worker.create({
    dataConverter: defaultDataConverter,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'e2e-1',
  });
};

export const runWorker = async () => {
  worker = await createWorker();

  return worker.run();
};

export const runWorkerUntil = async (completed: Promise<unknown>) => {
  worker = await createWorker();

  return worker.runUntil(completed);
};

export const stopWorker = async () => {
  if (worker && worker.getState() === 'RUNNING') {
    worker.shutdown();
  }
};
