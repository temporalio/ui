import type { WorkflowExecution } from '$lib/types/workflows';
import {
  getMillisecondDuration,
  toQueryDuration,
} from '$lib/utilities/format-time';
import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
import type { QuickFilterValue } from '$lib/utilities/query/quick-filter';
import {
  getColumnAttribute,
  type QuickFilterColumns,
} from '$lib/utilities/query/quick-filter-table';

export const WORKFLOW_COLUMN_ATTRIBUTE: Record<string, string> = {
  Status: 'ExecutionStatus',
  'Workflow ID': 'WorkflowId',
  'Run ID': 'RunId',
  Type: 'WorkflowType',
  Start: 'StartTime',
  End: 'CloseTime',
  'Execution Time': 'ExecutionTime',
  'Task Queue': 'TaskQueue',
  'History Size': 'HistorySizeBytes',
  'History Length': 'HistoryLength',
  'State Transitions': 'StateTransitionCount',
  'Execution Duration': 'ExecutionDuration',
  Deployment: 'TemporalWorkerDeployment',
  'Deployment Version': 'TemporalWorkerDeploymentVersion',
  'Build ID': 'TemporalWorkerBuildId',
  'Versioning Behavior': 'TemporalWorkflowVersioningBehavior',
  'Scheduled By ID': 'TemporalScheduledById',
  'Scheduled Start Time': 'TemporalScheduledStartTime',
  'Change Version': 'TemporalChangeVersion',
};

// Parent Namespace is not an indexed search attribute, so there is nothing to
// filter by.
export const UNFILTERABLE_WORKFLOW_COLUMNS = ['Parent Namespace'];

// Only columns the archival query surface supports. Archival visibility accepts
// a narrower set of attributes and operators than standard visibility.
export const ARCHIVAL_FILTERABLE_COLUMNS = ['Type', 'Workflow ID', 'Run ID'];

const positiveCount = (count: string): string | undefined =>
  parseInt(count, 10) > 0 ? count : undefined;

export const getWorkflowColumnValue = (
  label: string,
  workflow: WorkflowExecution,
): QuickFilterValue => {
  const indexedFields = workflow?.searchAttributes?.indexedFields;

  switch (label) {
    case 'Status':
      return workflow.status;
    case 'Workflow ID':
      return workflow.id;
    case 'Run ID':
      return workflow.runId;
    case 'Type':
      return workflow.name;
    case 'Start':
      return workflow.startTime;
    case 'End':
      return workflow.endTime;
    case 'Execution Time':
      return workflow.executionTime;
    case 'Task Queue':
      return workflow.taskQueue;
    case 'History Size':
      return workflow.historySizeBytes;
    case 'History Length':
      return positiveCount(workflow.historyEvents);
    case 'State Transitions':
      return positiveCount(workflow.stateTransitionCount);
    case 'Build ID':
      return (
        indexedFields?.TemporalWorkerBuildId ||
        getBuildIdFromVersion(indexedFields?.TemporalWorkerDeploymentVersion)
      );
    case 'Execution Duration': {
      // No duration field on the workflow, and a running one has no end time, so
      // the cell renders blank and there is nothing to filter by.
      const milliseconds = getMillisecondDuration({
        start: workflow.startTime,
        end: workflow.endTime,
        onlyUnderSecond: false,
      });
      return milliseconds ? toQueryDuration(milliseconds) : undefined;
    }
    case 'Parent Namespace':
      return undefined;
    default:
      return indexedFields?.[
        getColumnAttribute(WORKFLOW_COLUMN_ATTRIBUTE, label)
      ];
  }
};

export const WORKFLOW_QUICK_FILTER_COLUMNS: QuickFilterColumns<WorkflowExecution> =
  {
    attributes: WORKFLOW_COLUMN_ATTRIBUTE,
    getValue: getWorkflowColumnValue,
    unfilterable: UNFILTERABLE_WORKFLOW_COLUMNS,
  };
