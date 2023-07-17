import { createRequire } from 'node:module';

import { DefaultLogger, Runtime, Worker } from '@temporalio/worker';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const logger = new DefaultLogger('ERROR', () => {});

Runtime.install({ logger });

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

const workerIsStopped = () => {
  return worker.getState() === 'STOPPED';
};

export const runWorker = async (): Promise<void> => {
  worker = await createWorker();
  worker.run();

  return new Promise<void>((resolve) => {
    (function waitForWorkerToBeRunning() {
      if (workerIsRunning()) {
        console.log('✨ temporal worker is running');
        return resolve();
      }
      setTimeout(waitForWorkerToBeRunning, 100);
    })();
  });
};

export const runWorkerUntil = async (completed: Promise<unknown>) => {
  worker = await createWorker();

  return worker.runUntil(completed);
};

export const stopWorker = async (): Promise<void> => {
  if (worker && workerIsRunning()) {
    worker.shutdown();

    return new Promise<void>((resolve) => {
      (function waitForWorkerToBeStopped() {
        if (workerIsStopped()) {
          console.log('🔪 killed temporal worker');
          return resolve();
        }
        setTimeout(waitForWorkerToBeStopped, 1000);
      })();
    });
  }
};
