import { createRequire } from 'node:module';
import { Worker } from '@temporalio/worker';

import * as activities from './activities/index';
import { defaultDataConverter } from '@temporalio/common';

const require = createRequire(import.meta.url);

let worker: Worker;

const createWorker1 = async () =>
  Worker.create({
    dataConverter: defaultDataConverter,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'e2e-1',
  });

export const runWorker = async () => {
  worker = await createWorker1();

  return worker.run();
};

export const runWorkerUntil = async (completed: Promise<unknown>) => {
  worker = await createWorker1();

  return worker.runUntil(completed);
};

export const stopWorker = async () => {
  if (worker.getState() === 'RUNNING') {
    worker.shutdown();
  }
};
