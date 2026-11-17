import type { HistoryEvent } from '$lib/types/events';
import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

export type Transition = 'continuedAsNew' | 'retry' | 'cron';

const INITIATOR_TRANSITIONS: Readonly<Record<string, Transition>> = {
  Workflow: 'continuedAsNew',
  Retry: 'retry',
  CronSchedule: 'cron',
};

export const transitionOf = (startedEvent: HistoryEvent): Transition | null => {
  const attributes = startedEvent.workflowExecutionStartedEventAttributes;
  if (!attributes?.continuedExecutionRunId) {
    return null;
  }
  const initiator = attributes.initiator as unknown;
  if (typeof initiator !== 'string') {
    return 'continuedAsNew';
  }
  const name = fromScreamingEnum(initiator, 'ContinueAsNewInitiator');
  return INITIATOR_TRANSITIONS[name] ?? 'continuedAsNew';
};
