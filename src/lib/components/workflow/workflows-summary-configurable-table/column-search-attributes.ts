import type { WorkflowExecution } from '$lib/types/workflows';
import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
import type { QuickFilterValue } from '$lib/utilities/query/quick-filter';

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
  Deployment: 'TemporalWorkerDeployment',
  'Deployment Version': 'TemporalWorkerDeploymentVersion',
  'Build ID': 'TemporalWorkerBuildId',
  'Versioning Behavior': 'TemporalWorkflowVersioningBehavior',
  'Scheduled By ID': 'TemporalScheduledById',
  'Scheduled Start Time': 'TemporalScheduledStartTime',
  'Change Version': 'TemporalChangeVersion',
};

// Columns without a search attribute to filter on. Parent Namespace is not
// indexed, and Execution Duration is derived from start and end times rather
// than read from the workflow, so there is no value to filter by.
export const UNFILTERABLE_WORKFLOW_COLUMNS = [
  'Parent Namespace',
  'Execution Duration',
];

// Only columns the archival query surface supports. Archival visibility accepts
// a narrower set of attributes and operators than standard visibility.
export const ARCHIVAL_FILTERABLE_COLUMNS = ['Type', 'Workflow ID', 'Run ID'];

const positiveCount = (count: string): string | undefined =>
  parseInt(count, 10) > 0 ? count : undefined;

export const getWorkflowColumnAttribute = (label: string): string =>
  WORKFLOW_COLUMN_ATTRIBUTE[label] ?? label;

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
    case 'Parent Namespace':
    case 'Execution Duration':
      return undefined;
    default:
      return indexedFields?.[getWorkflowColumnAttribute(label)];
  }
};
