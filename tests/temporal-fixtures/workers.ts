import { createRequire } from 'node:module';
import { Worker } from '@temporalio/worker';
import { defaultDataConverter } from '@temporalio/common';

import * as activities from '$temporal-fixtures/activities';

const require = createRequire(import.meta.url);

let worker1: Worker;
let worker2: Worker;

const createWorker1 = () =>
  Worker.create({
    dataConverter: defaultDataConverter,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'e2e-1',
  });

// Second task queue has only the workflow registered.
// This allows us to ensure there is a pending activity as there are no workers polling for activities on this queue.
const createWorker2 = () =>
  Worker.create({
    dataConverter: defaultDataConverter,
    workflowsPath: require.resolve('./workflows'),
    taskQueue: 'e2e-2',
    enableNonLocalActivities: false,
  });

export const runWorkers = async (completed: Promise<unknown>[]) => {
  worker1 = await createWorker1();
  worker2 = await createWorker2();

  worker1.runUntil(Promise.all(completed));
  worker2.runUntil(Promise.all(completed));
};

export const stopWorkers = async () => {
  worker1.shutdown();
  worker2.shutdown();
};
