import type { BadgeStatusValue } from '$lib/io/badge-status/badge-status.svelte';
import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

import type { CatalogSession, CatalogSessionState } from './session-store';
import type { ExecutionTerminalStatus } from './workbench-host';

const terminalBadgeStatuses: Record<ExecutionTerminalStatus, BadgeStatusValue> =
  {
    canceled: 'Canceled',
    completed: 'Completed',
    'continued-as-new': 'ContinuedAsNew',
    failed: 'Failed',
    terminated: 'Terminated',
    'timed-out': 'TimedOut',
  };

export interface TerminalSessionStatus {
  status: BadgeStatusValue;
}

export interface ActiveSessionStatus {
  label: string;
}

export type SessionStatusPresentation =
  | TerminalSessionStatus
  | ActiveSessionStatus;

const sessionStateLabels: Record<CatalogSessionState, string> = {
  'execution-terminal': 'Closed',
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
    return { status: terminalBadgeStatuses[terminalStatus] };
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
