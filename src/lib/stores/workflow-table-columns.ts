import { formatBytes } from '$lib/utilities/format-bytes';
import { formatDate } from '$lib/utilities/format-date';
import { formatDistance } from '$lib/utilities/format-time';
import { derived } from 'svelte/store';
import { persistStore } from './persist-store';
import { customSearchAttributes } from './search-attributes';

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
  | 'Task Queue';

export type WorkflowHeader = {
  label: WorkflowHeaderLabel | string;
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

type State = WorkflowHeader[];

type Action =
  | {
      type: 'WORKFLOW_COLUMN.ADD';
      payload: { label: WorkflowHeaderLabel | string };
    }
  | {
      type: 'WORKFLOW_COLUMN.REMOVE';
      payload: { label: WorkflowHeaderLabel | string };
    }
  | {
      type: 'WORKFLOW_COLUMN.PIN';
      payload: { label: WorkflowHeaderLabel | string };
    }
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
      formatBytes(parseInt(historySizeBytes, 10)),
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
};

const workflowTableColumns = persistStore(
  'workflow-table-columns',
  DEFAULT_COLUMNS,
);

const availableWorkflowColumns = derived(
  [workflowTableColumns],
  ([$workflowTableColumns]) =>
    [...DEFAULT_COLUMNS, ...DEFAULT_AVAILABLE_COLUMNS].filter(
      (header) =>
        !$workflowTableColumns.some((column) => column.label === header.label),
    ),
);

const availableSearchAttributes = derived(
  [customSearchAttributes, workflowTableColumns],
  ([$customSearchAttributes, $workflowTableColumns]) =>
    Object.keys($customSearchAttributes).filter(
      (searchAttribute) =>
        !$workflowTableColumns.some(
          (column) => column.label === searchAttribute,
        ),
    ),
);

const reducer = (action: Action, state: State): State => {
  switch (action.type) {
    case 'WORKFLOW_COLUMN.ADD': {
      const { label } = action.payload;

      return [...state, { label, pinned: false }];
    }
    case 'WORKFLOW_COLUMN.REMOVE': {
      const { label: labelToRemove } = action.payload;

      return state.filter(({ label }) => label !== labelToRemove);
    }
    case 'WORKFLOW_COLUMN.PIN': {
      const { label: labelToPin } = action.payload;
      const index = state.findIndex(({ label }) => label === labelToPin);

      const isPinned = state[index].pinned;

      let lastPinned = -1;
      for (let i = state.length - 1; i >= 0; i--) {
        if (state[i].pinned) {
          lastPinned = i;
          break;
        }
      }

      const newColumns = [...state];
      newColumns[index].pinned = !isPinned;

      if (index > lastPinned && !isPinned) {
        newColumns.splice(lastPinned + 1, 0, newColumns.splice(index, 1)[0]);
      } else if (index < lastPinned && isPinned) {
        newColumns.splice(lastPinned, 0, newColumns.splice(index, 1)[0]);
      }

      return newColumns;
    }
    case 'WORKFLOW_COLUMN.MOVE': {
      const { from, to } = action.payload;
      const isPinned = state[from].pinned;

      let lastPinned = 0;
      for (let i = state.length - 1; i >= 0; i--) {
        if (state[i].pinned) {
          lastPinned = i;
          break;
        }
      }

      const tempColumns = [...state];
      if (to <= lastPinned && !isPinned) {
        tempColumns[from].pinned = true;
      } else if (to > lastPinned && isPinned) {
        tempColumns[from].pinned = false;
      }

      tempColumns.splice(to, 0, tempColumns.splice(from, 1)[0]);

      return tempColumns.map((c, idx) =>
        idx > MAX_PINNED_COLUMNS - 1 ? { ...c, pinned: false } : c,
      );
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

const addColumn = (label: WorkflowHeaderLabel | string) => {
  dispatch({ type: 'WORKFLOW_COLUMN.ADD', payload: { label } });
};

const removeColumn = (label: WorkflowHeaderLabel | string) => {
  dispatch({ type: 'WORKFLOW_COLUMN.REMOVE', payload: { label } });
};

const moveColumn = (from: number, to: number) => {
  dispatch({ type: 'WORKFLOW_COLUMN.MOVE', payload: { from, to } });
};

const pinColumn = (label: WorkflowHeaderLabel | string) => {
  dispatch({ type: 'WORKFLOW_COLUMN.PIN', payload: { label } });
};

export {
  workflowTableColumns,
  availableSearchAttributes,
  availableWorkflowColumns,
  addColumn,
  removeColumn,
  moveColumn,
  pinColumn,
};
