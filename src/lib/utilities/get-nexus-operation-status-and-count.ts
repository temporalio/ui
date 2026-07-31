import type { NexusOperationExecutionStatus } from '$lib/types/nexus-operation-execution';
import { parseRawPayloadToJSON } from '$lib/utilities/decode-payload';

export type NexusOperationStatus =
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'Canceled'
  | 'Terminated'
  | 'TimedOut';

export const nexusOperationStatuses: NexusOperationStatus[] = [
  'Running',
  'Completed',
  'Failed',
  'Canceled',
  'Terminated',
  'TimedOut',
];

const executionStatusToNexusOperationStatus: Record<
  NexusOperationExecutionStatus,
  NexusOperationStatus
> = {
  NEXUS_OPERATION_EXECUTION_STATUS_UNSPECIFIED: 'Running',
  NEXUS_OPERATION_EXECUTION_STATUS_RUNNING: 'Running',
  NEXUS_OPERATION_EXECUTION_STATUS_COMPLETED: 'Completed',
  NEXUS_OPERATION_EXECUTION_STATUS_FAILED: 'Failed',
  NEXUS_OPERATION_EXECUTION_STATUS_CANCELED: 'Canceled',
  NEXUS_OPERATION_EXECUTION_STATUS_TERMINATED: 'Terminated',
  NEXUS_OPERATION_EXECUTION_STATUS_TIMED_OUT: 'TimedOut',
};

export const toNexusOperationStatus = (
  status: NexusOperationExecutionStatus,
): NexusOperationStatus => {
  return executionStatusToNexusOperationStatus[status] ?? 'Running';
};

export const getNexusOperationStatusAndCountOfGroup = (
  groups: { count: string; groupValues: unknown[] }[] = [],
): { status: NexusOperationStatus; count: number }[] => {
  return groups
    .map((group) => {
      const value = group?.groupValues[0];
      const rawStatus = (
        typeof value === 'string'
          ? value
          : parseRawPayloadToJSON(
              value as Parameters<typeof parseRawPayloadToJSON>[0],
            )
      ) as NexusOperationStatus;
      const count = parseInt(group.count);
      return { status: rawStatus, count };
    })
    .sort((a, b) => {
      return (
        nexusOperationStatuses.indexOf(a.status) -
        nexusOperationStatuses.indexOf(b.status)
      );
    });
};
