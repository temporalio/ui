import type { BadgeStatusValue } from '$lib/io/badge-status/badge-status.svelte';
import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

import type { CatalogSession, CatalogSessionState } from './session-store';
import type { ExecutionTerminalStatus } from './workbench-host';

type TerminalStatusPresentation = {
  label: string;
  status: BadgeStatusValue;
};

const terminalStatusPresentations: Record<
  ExecutionTerminalStatus,
  TerminalStatusPresentation
> = {
  canceled: { label: 'Canceled', status: 'Canceled' },
  completed: { label: 'Completed', status: 'Completed' },
  'continued-as-new': {
    label: 'Continued as new',
    status: 'ContinuedAsNew',
  },
  failed: { label: 'Failed', status: 'Failed' },
  terminated: { label: 'Terminated', status: 'Terminated' },
  'timed-out': { label: 'Timed out', status: 'TimedOut' },
};

export const terminalStatusPresentation = (
  status: ExecutionTerminalStatus,
): TerminalStatusPresentation => terminalStatusPresentations[status];

export interface SessionStatusPresentation {
  label: string;
  status?: BadgeStatusValue;
}

const sessionStateLabels: Record<CatalogSessionState, string> = {
  'execution-terminal': 'Finished',
  'launch-rejected': 'Start failed',
  'launch-uncertain': 'Start not confirmed',
  'observation-paused': 'Status checks paused',
  observing: 'Running',
  starting: 'Starting',
  stopped: 'Status checks stopped',
};

export const sessionStatusPresentation = ({
  state,
  terminalStatus,
}: Pick<
  CatalogSession,
  'state' | 'terminalStatus'
>): SessionStatusPresentation => {
  if (state === 'execution-terminal' && terminalStatus) {
    return terminalStatusPresentation(terminalStatus);
  }

  return { label: sessionStateLabels[state] };
};

export const relativeRunTime = (createdAt: number, now: number): string => {
  const distance = formatDistanceAbbreviated({
    start: createdAt,
    end: now,
    flexibleUnits: true,
  });

  return distance ? `${distance} ago` : 'just now';
};
