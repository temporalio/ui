import type { BadgeStatusValue } from '$lib/io/badge-status';

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
