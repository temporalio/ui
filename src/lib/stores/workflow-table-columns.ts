import { formatDistance } from 'date-fns';
import type { WorkflowExecution } from 'src/types/workflow';
import { persistStore } from './persist-store';

type WorkflowHeader =
  | 'Status'
  | 'Workflow ID'
  | 'Run ID'
  | 'Type'
  | 'Start'
  | 'End'
  | 'History Size'
  | 'History Length'
  | 'Execution Time'
  | 'State Transitions'
  | 'Parent Namespace'
  | 'Parent Workflow ID'
  | 'Task Queue'
  | 'Search Attributes'
  | 'Custom Search Attributes'
  | 'Memo'
  | 'Memo Custom Key';

type WorkflowCell =
  | ({
      label: WorkflowHeader;
    } & { path: keyof WorkflowExecution })
  | { data: (wf: WorkflowExecution) => string };

type State = {
  columns: WorkflowHeader[];
  availableColumns: WorkflowHeader[];
};

type Action =
  | { type: 'WORKFLOW_COLUMN.ADD'; payload: { index: number } }
  | { type: 'WORKFLOW_COLUMN.REMOVE'; payload: { index: number } }
  | { type: 'WORKFLOW_COLUMN.MOVE'; payload: { from: number; to: number } };

const DEFAULT_COLUMNS: WorkflowHeader[] = [
  'Status',
  'Workflow ID',
  'Run ID',
  'Type',
  'Start',
  'End',
];

const DEFAULT_AVAILABLE_COLUMNS: WorkflowHeader[] = [
  'History Size',
  'History Length',
  'Execution Time',
  'State Transitions',
  'Parent Namespace',
  'Parent Workflow ID',
  'Task Queue',
  'Search Attributes',
  'Custom Search Attributes',
  'Memo',
  'Memo Custom Key',
];

const WORKFLOW_CELLS: Record<WorkflowHeader, WorkflowCell> = {
  Status: { label: 'Status', path: 'status' },
  'Workflow ID': { label: 'Workflow ID', path: 'id' },
  'Run ID': { label: 'Run ID', path: 'runId' },
  Type: { label: 'Type', path: 'name' },
  Start: { label: 'Start', path: 'startTime' },
  End: { label: 'End', path: 'endTime' },
  'History Length': { label: 'History Length', path: 'historyEvents' },
  'History Size': { label: 'History Size', path: 'historyEvents' }, // TODO: add historySizeBytes
  'Execution Time': {
    label: 'Execution Time',
    data: (execution) =>
      formatDistance(
        new Date(execution.endTime),
        new Date(execution.startTime),
      ),
  },
  'State Transitions': {
    label: 'State Transitions',
    path: 'stateTransitionCount',
  },
  'Parent Namespace': { label: 'Parent Namespace', path: 'parentNamespaceId' },
  'Parent Workflow ID': { label: 'Parent Workflow ID', path: 'parent' },
  'Task Queue': { label: 'Task Queue', path: 'taskQueue' },
  'Search Attributes': { label: 'Search Attributes', data: () => 'TBD' },
  'Custom Search Attributes': {
    label: 'Custom Search Attributes',
    data: () => 'TBD',
  },
  Memo: { label: 'Memo', data: () => 'TBD' },
  'Memo Custom Key': { label: 'Memo', data: () => 'TBD' },
};

const initialState: State = {
  columns: DEFAULT_COLUMNS,
  availableColumns: DEFAULT_AVAILABLE_COLUMNS,
};

const workflowTableColumns = persistStore(
  'workflow-table-columns',
  initialState,
);

const reducer = (action: Action, state: State): State => {
  switch (action.type) {
    case 'WORKFLOW_COLUMN.ADD': {
      const { columns, availableColumns } = state;
      const { index } = action.payload;

      const tempAvailableColumns = [...availableColumns];
      const [addedColumn] = tempAvailableColumns.splice(index, 1);

      return {
        columns: [...columns, addedColumn],
        availableColumns: tempAvailableColumns,
      };
    }
    case 'WORKFLOW_COLUMN.REMOVE': {
      const { columns, availableColumns } = state;
      const { index } = action.payload;
      const tempColumns = [...columns];
      const [removedColumn] = tempColumns.splice(index, 1);

      return {
        columns: tempColumns,
        availableColumns: [removedColumn, ...availableColumns],
      };
    }
    case 'WORKFLOW_COLUMN.MOVE': {
      const { columns } = state;
      const { from, to } = action.payload;

      const tempColumns = [...columns];
      tempColumns.splice(to, 0, tempColumns.splice(from, 1)[0]);
      return {
        ...state,
        columns: tempColumns,
      };
    }
    default:
      return state;
  }
};

const dispatch = (action: Action) => {
  workflowTableColumns.update((previousState) =>
    reducer(action, previousState),
  );
};

const addColumn = (index: number) => {
  dispatch({ type: 'WORKFLOW_COLUMN.ADD', payload: { index } });
};

const removeColumn = (index: number) => {
  dispatch({ type: 'WORKFLOW_COLUMN.REMOVE', payload: { index } });
};

const moveColumn = (from: number, to: number) => {
  dispatch({ type: 'WORKFLOW_COLUMN.MOVE', payload: { from, to } });
};

export { workflowTableColumns, addColumn, removeColumn, moveColumn };
