import type { ExecutionTerminalStatus } from './workbench-host';

export const terminalStatusPresentation = (status: ExecutionTerminalStatus) => {
  if (status === 'completed') {
    return { label: 'Completed', type: 'success' as const };
  }
  if (status === 'canceled') {
    return { label: 'Canceled', type: 'warning' as const };
  }
  if (status === 'continued-as-new') {
    return { label: 'Continued as new', type: 'primary' as const };
  }

  const label =
    status === 'timed-out'
      ? 'Timed out'
      : `${status[0]?.toUpperCase()}${status.slice(1)}`;

  return { label, type: 'danger' as const };
};
