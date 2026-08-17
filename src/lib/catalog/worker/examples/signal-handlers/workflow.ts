import {
  condition,
  defineQuery,
  defineSignal,
  proxyActivities,
  setHandler,
  workflowInfo,
} from '@temporalio/workflow';

import type * as activities from './activity.js';

const { signalActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 20,
    initialInterval: '2 seconds',
    maximumInterval: '10 seconds',
    backoffCoefficient: 1.5,
  },
});

const testSignal = defineSignal<[string]>('test-signal');
const completeSignal = defineSignal<[boolean]>('complete-signal');
const getStateQuery = defineQuery<string>('get-state');
const getCounterQuery = defineQuery<number>('get-counter');

export async function signalWorkflow(timeoutSeconds = 30): Promise<string> {
  let state = 'waiting';
  let signalReceived = '';
  let completionRequested: boolean | undefined;
  let counter = 0;

  setHandler(testSignal, (value) => {
    signalReceived = value;
    state = 'signal-received';
    counter += 1;
  });
  setHandler(completeSignal, (shouldComplete) => {
    completionRequested = shouldComplete;
    state = shouldComplete ? 'completed' : 'cancelled';
  });
  setHandler(getStateQuery, () => state);
  setHandler(getCounterQuery, () => counter);

  const firstSignalReceived = await condition(
    () => signalReceived !== '',
    `${timeoutSeconds} seconds`,
  );
  if (!firstSignalReceived) {
    return `TIMEOUT: No signal received after ${timeoutSeconds}s. State: ${state}, Signals received: ${counter}`;
  }

  await signalActivity(
    workflowInfo().workflowId,
    'test-signal',
    signalReceived,
  );

  const completionSignalReceived = await condition(
    () => completionRequested !== undefined,
    `${timeoutSeconds} seconds`,
  );
  if (!completionSignalReceived) {
    return `TIMEOUT: No completion signal received after ${timeoutSeconds}s. State: ${state}, Signals received: ${counter}`;
  }

  return `${completionRequested ? 'SUCCESS' : 'CANCELLED'}: Workflow ${state}. Signals received: ${counter}, Last signal value: ${signalReceived}`;
}
