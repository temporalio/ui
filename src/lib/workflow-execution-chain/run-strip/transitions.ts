import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

import { readResetBaseRunId } from '../chain-context.svelte';
import type { ChainRun } from '../types';

export type Transition = 'continuedAsNew' | 'retry' | 'cron' | 'reset';

const INITIATOR_TRANSITIONS: Readonly<Record<string, Transition>> = {
  Workflow: 'continuedAsNew',
  Retry: 'retry',
  CronSchedule: 'cron',
};

export const transitionOf = (
  run: Pick<ChainRun, 'runId' | 'startedEvent'>,
): Transition | null => {
  if (readResetBaseRunId(run)) {
    return 'reset';
  }
  const attributes = run.startedEvent.workflowExecutionStartedEventAttributes;
  if (!attributes?.continuedExecutionRunId) {
    return null;
  }
  const initiator = attributes.initiator as unknown;
  if (typeof initiator !== 'string') {
    return 'continuedAsNew';
  }
  const initiatorName = fromScreamingEnum(initiator, 'ContinueAsNewInitiator');
  return INITIATOR_TRANSITIONS[initiatorName] ?? 'continuedAsNew';
};
