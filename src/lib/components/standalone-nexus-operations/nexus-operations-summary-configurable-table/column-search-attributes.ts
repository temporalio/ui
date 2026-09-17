import type { NexusOperationExecutionListInfo } from '$lib/types/nexus-operation-execution';
import type { QuickFilterValue } from '$lib/utilities/query/quick-filter';

export const NEXUS_OPERATION_COLUMN_ATTRIBUTE: Record<string, string> = {
  'Operation ID': 'OperationId',
  'Run ID': 'RunId',
  Endpoint: 'Endpoint',
  Service: 'Service',
  Operation: 'Operation',
  Status: 'ExecutionStatus',
  'Schedule Time': 'ScheduleTime',
  'Close Time': 'CloseTime',
  'State Transitions': 'StateTransitionCount',
};

// Execution Duration is derived from the schedule and close times, and its
// ExecutionDuration attribute is indexed in nanoseconds, so there is no value
// to filter by.
export const UNFILTERABLE_NEXUS_OPERATION_COLUMNS = ['Execution Duration'];

export const getNexusOperationColumnAttribute = (label: string): string =>
  NEXUS_OPERATION_COLUMN_ATTRIBUTE[label] ?? label;

export const getNexusOperationColumnValue = (
  label: string,
  operation: NexusOperationExecutionListInfo,
): QuickFilterValue => {
  switch (label) {
    case 'Operation ID':
      return operation.operationId;
    case 'Run ID':
      return operation.runId;
    case 'Endpoint':
      return operation.endpoint;
    case 'Service':
      return operation.service;
    case 'Operation':
      return operation.operation;
    case 'Status':
      return operation.status;
    case 'Schedule Time':
      return operation.scheduleTime;
    case 'Close Time':
      return operation.closeTime;
    case 'State Transitions':
      return operation.stateTransitionCount;
    default:
      return undefined;
  }
};
