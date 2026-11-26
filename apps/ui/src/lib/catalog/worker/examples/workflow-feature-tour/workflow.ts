import {
  condition,
  createNexusServiceClient,
  defineSignal,
  defineUpdate,
  executeChild,
  proxyActivities,
  setHandler,
  sleep,
  workflowInfo,
} from '@temporalio/workflow';

import type * as activities from './activity.js';
import { featureTourEndpoint, featureTourService } from './service.js';
import { hello } from '../hello/workflow.js';

const { featureTourActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
});

const addNoteUpdate = defineUpdate<number, [string]>('add-note');
const closeSignal = defineSignal('close');

export async function featureTourWorkflow(timerSeconds = 10): Promise<string> {
  const notes: string[] = [];
  let closeRequested = false;

  setHandler(
    addNoteUpdate,
    (note) => {
      notes.push(note);
      return notes.length;
    },
    {
      validator: (note) => {
        if (!note.trim()) throw new Error('Note must not be empty');
      },
    },
  );
  setHandler(closeSignal, () => {
    closeRequested = true;
  });

  const activityResult = await featureTourActivity('feature tour');

  await sleep(`${timerSeconds} seconds`);

  const childResult = await executeChild(hello, {
    args: ['feature tour child'],
    workflowId: `${workflowInfo().workflowId}-child`,
  });

  const nexusClient = createNexusServiceClient({
    service: featureTourService,
    endpoint: featureTourEndpoint,
  });
  const nexusResult = await nexusClient.executeOperation(
    featureTourService.operations.echo,
    { message: 'feature tour' },
    { scheduleToCloseTimeout: '30s' },
  );

  await condition(() => closeRequested);

  return [
    activityResult,
    `Timer fired after ${timerSeconds}s`,
    `Child workflow: ${childResult}`,
    nexusResult,
    `Updates received: ${notes.length}${notes.length ? ` (${notes.join(', ')})` : ''}`,
    'Closed by signal',
  ].join('\n');
}
