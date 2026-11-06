import {
  defineUpdate,
  proxyActivities,
  setHandler,
} from '@temporalio/workflow';

export const crashWorkerUpdate = defineUpdate<string>('crashWorker');

const { dangerousOperation } = proxyActivities<{
  dangerousOperation: () => Promise<string>;
}>({
  startToCloseTimeout: '10 seconds',
  heartbeatTimeout: '2 seconds',
  retry: { initialInterval: '1 second', maximumAttempts: 5 },
});

export const handleCrashWorker = () =>
  setHandler(crashWorkerUpdate, () => dangerousOperation());
