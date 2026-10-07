import type { NexusOperationExecutionListInfo } from '$lib/types/nexus-operation-execution';
import {
  durationStringToMilliseconds,
  toQueryDuration,
} from '$lib/utilities/format-time';
import type { QuickFilterValue } from '$lib/utilities/query/quick-filter';
import {
  getColumnAttribute,
  type QuickFilterColumns,
} from '$lib/utilities/query/quick-filter-table';

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
  'Execution Duration': 'ExecutionDuration',
};

export const UNFILTERABLE_NEXUS_OPERATION_COLUMNS: string[] = [];

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
    case 'Execution Duration': {
      const milliseconds = durationStringToMilliseconds(
        operation.executionDuration,
      );
      return milliseconds ? toQueryDuration(milliseconds) : undefined;
    }
    default:
      return operation.searchAttributes?.indexedFields?.[
        getColumnAttribute(NEXUS_OPERATION_COLUMN_ATTRIBUTE, label)
      ];
  }
};

export const NEXUS_OPERATION_QUICK_FILTER_COLUMNS: QuickFilterColumns<NexusOperationExecutionListInfo> =
  {
    attributes: NEXUS_OPERATION_COLUMN_ATTRIBUTE,
    getValue: getNexusOperationColumnValue,
    unfilterable: UNFILTERABLE_NEXUS_OPERATION_COLUMNS,
  };
