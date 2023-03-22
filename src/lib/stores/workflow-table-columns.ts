import { formatDate } from '$lib/utilities/format-date';
import { formatDistance } from '$lib/utilities/format-time';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { persistStore } from './persist-store';

export const MAX_PINNED_COLUMNS = 2;

type WorkflowHeaderLabel =
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
  | 'Memo';
// ToDo: Support this columns
// | 'Search Attributes'
// | 'Custom Search Attributes'
// | 'Memo Custom Key';

export type WorkflowHeader = {
  label: WorkflowHeaderLabel;
  pinned: boolean;
};

interface BaseWorkflowCell {
  label: WorkflowHeaderLabel;
}

interface PathCell extends BaseWorkflowCell {
  path: keyof WorkflowExecution;
  data?: never;
}

interface DataCell extends BaseWorkflowCell {
  data: (
    workflow: WorkflowExecution,
    timeFormat: TimeFormat | string,
  ) => string;
  path?: never;
}

type WorkflowCell = PathCell | DataCell;

export const isPathCell = (cell: WorkflowCell): cell is PathCell =>
  !!cell?.path;

export const isDataCell = (cell: WorkflowCell): cell is DataCell =>
  !!cell?.data;

type State = {
  columns: WorkflowHeader[];
  availableColumns: WorkflowHeader[];
};

type Action =
  | { type: 'WORKFLOW_COLUMN.ADD'; payload: { index: number } }
  | { type: 'WORKFLOW_COLUMN.REMOVE'; payload: { index: number } }
  | { type: 'WORKFLOW_COLUMN.PIN'; payload: { index: number } }
  | { type: 'WORKFLOW_COLUMN.MOVE'; payload: { from: number; to: number } };

const DEFAULT_COLUMNS: WorkflowHeader[] = [
  { label: 'Status', pinned: true },
  { label: 'Workflow ID', pinned: true },
  { label: 'Run ID', pinned: false },
  { label: 'Type', pinned: false },
  { label: 'Start', pinned: false },
  { label: 'End', pinned: false },
];

const DEFAULT_AVAILABLE_COLUMNS: WorkflowHeader[] = [
  { label: 'History Size', pinned: false },
  { label: 'History Length', pinned: false },
  { label: 'Execution Time', pinned: false },
  { label: 'State Transitions', pinned: false },
  { label: 'Parent Namespace', pinned: false },
  { label: 'Parent Workflow ID', pinned: false },
  { label: 'Task Queue', pinned: false },
  { label: 'Memo', pinned: false },
  // { label: 'Search Attributes' },
  // { label: 'Custom Search Attributes' },
  // { label: 'Memo Custom Key' },
];

export const WORKFLOW_CELLS: Record<WorkflowHeaderLabel, WorkflowCell> = {
  Status: { label: 'Status', path: 'status' },
  'Workflow ID': { label: 'Workflow ID', path: 'id' },
  'Run ID': { label: 'Run ID', path: 'runId' },
  Type: { label: 'Type', path: 'name' },
  Start: {
    label: 'Start',
    data: ({ startTime }: WorkflowExecution, format: TimeFormat | string) =>
      formatDate(startTime, format),
  },
  End: {
    label: 'End',
    data: ({ endTime }: WorkflowExecution, format: TimeFormat | string) =>
      endTime ? formatDate(endTime, format) : '',
  },
  'History Length': { label: 'History Length', path: 'historyEvents' },
  'History Size': {
    label: 'History Size',
    data: ({ historySizeBytes }: WorkflowExecution) =>
      historySizeBytes ? `${historySizeBytes} Bytes` : '',
  },
  'Execution Time': {
    label: 'Execution Time',
    data: ({ startTime, endTime }: WorkflowExecution) =>
      formatDistance({ start: startTime, end: endTime }),
  },
  'State Transitions': {
    label: 'State Transitions',
    path: 'stateTransitionCount',
  },
  'Parent Namespace': { label: 'Parent Namespace', path: 'parentNamespaceId' },
  'Parent Workflow ID': { label: 'Parent Workflow ID', path: 'parent' },
  'Task Queue': { label: 'Task Queue', path: 'taskQueue' },
  Memo: {
    label: 'Memo',
    data: ({ memo }: WorkflowExecution) =>
      memo.fields ? stringifyWithBigInt(memo.fields) : '',
  },
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
      removedColumn.pinned = false;

      return {
        columns: tempColumns,
        availableColumns: [removedColumn, ...availableColumns],
      };
    }
    case 'WORKFLOW_COLUMN.PIN': {
      const { columns } = state;
      const { index } = action.payload;

      const isPinned = columns[index].pinned;

      let lastPinned = -1;
      for (let i = columns.length - 1; i >= 0; i--) {
        if (columns[i].pinned) {
          lastPinned = i;
          break;
        }
      }

      const tempColumns = [...columns];
      tempColumns[index].pinned = !isPinned;

      if (index > lastPinned && !isPinned) {
        tempColumns.splice(lastPinned + 1, 0, tempColumns.splice(index, 1)[0]);
      } else if (index < lastPinned && isPinned) {
        tempColumns.splice(lastPinned, 0, tempColumns.splice(index, 1)[0]);
      }

      return {
        ...state,
        columns: tempColumns,
      };
    }
    case 'WORKFLOW_COLUMN.MOVE': {
      const { columns } = state;
      const { from, to } = action.payload;
      const isPinned = columns[from].pinned;

      let lastPinned = 0;
      for (let i = columns.length - 1; i >= 0; i--) {
        if (columns[i].pinned) {
          lastPinned = i;
          break;
        }
      }

      const tempColumns = [...columns];
      if (to < lastPinned && !isPinned) {
        tempColumns[from].pinned = true;
      } else if (to > lastPinned && isPinned) {
        tempColumns[from].pinned = false;
      }

      tempColumns.splice(to, 0, tempColumns.splice(from, 1)[0]);
      return {
        ...state,
        columns: tempColumns.map((c, idx) =>
          idx > MAX_PINNED_COLUMNS - 1 ? { ...c, pinned: false } : c,
        ),
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

const pinColumn = (index: number) => {
  dispatch({ type: 'WORKFLOW_COLUMN.PIN', payload: { index } });
};

export { workflowTableColumns, addColumn, removeColumn, moveColumn, pinColumn };
