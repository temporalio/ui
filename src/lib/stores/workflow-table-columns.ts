import { derived, type Readable } from 'svelte/store';
import { persistStore } from './persist-store';
import { customSearchAttributes } from './search-attributes';

export const MAX_PINNED_COLUMNS = 2;

export const WorkflowHeaderLabels = [
  'Status',
  'Workflow ID',
  'Run ID',
  'Type',
  'Start',
  'End',
  'History Size',
  'History Length',
  'Execution Time',
  'Execution Duration',
  'State Transitions',
  'Parent Namespace',
  'Parent Workflow ID',
  'Task Queue',
] as const;

export type WorkflowHeaderLabel = (typeof WorkflowHeaderLabels)[number];

// https://github.com/microsoft/TypeScript/issues/29729
// https://stackoverflow.com/a/61048124
// eslint-disable-next-line @typescript-eslint/ban-types
type AnyWorkflowHeaderLabel = WorkflowHeaderLabel | (string & {});

export type WorkflowHeader = {
  label: AnyWorkflowHeaderLabel;
  pinned: boolean;
};

type State = WorkflowHeader[];

type Action =
  | {
      type: 'WORKFLOW_COLUMN.ADD';
      payload: { label: AnyWorkflowHeaderLabel };
    }
  | {
      type: 'WORKFLOW_COLUMN.REMOVE';
      payload: { label: AnyWorkflowHeaderLabel };
    }
  | {
      type: 'WORKFLOW_COLUMN.PIN';
      payload: { label: AnyWorkflowHeaderLabel };
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
  { label: 'Execution Duration', pinned: false },
  { label: 'State Transitions', pinned: false },
  { label: 'Parent Namespace', pinned: false },
  { label: 'Parent Workflow ID', pinned: false },
  { label: 'Task Queue', pinned: false },
];

const workflowTableColumns = persistStore<WorkflowHeader[]>(
  'workflow-table-columns',
  DEFAULT_COLUMNS,
);

const pinnedColumnsWidth = persistStore<number>(
  'workflow-table-pinned-columns-width',
);

const availableWorkflowColumns: Readable<WorkflowHeader[]> = derived(
  [workflowTableColumns],
  ([$workflowTableColumns]) =>
    [...DEFAULT_COLUMNS, ...DEFAULT_AVAILABLE_COLUMNS].filter(
      (header) =>
        !$workflowTableColumns.some((column) => column.label === header.label),
    ),
);

const availableSearchAttributeColumns: Readable<WorkflowHeader[]> = derived(
  [customSearchAttributes, workflowTableColumns],
  ([$customSearchAttributes, $workflowTableColumns]) =>
    Object.keys($customSearchAttributes)
      .filter(
        (searchAttribute) =>
          !$workflowTableColumns.some(
            (column) => column.label === searchAttribute,
          ),
      )
      .map((key) => ({
        label: key,
        pinned: false,
      })),
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

const addColumn = (label: AnyWorkflowHeaderLabel) => {
  dispatch({ type: 'WORKFLOW_COLUMN.ADD', payload: { label } });
};

const removeColumn = (label: AnyWorkflowHeaderLabel) => {
  dispatch({ type: 'WORKFLOW_COLUMN.REMOVE', payload: { label } });
};

const moveColumn = (from: number, to: number) => {
  dispatch({ type: 'WORKFLOW_COLUMN.MOVE', payload: { from, to } });
};

const pinColumn = (label: AnyWorkflowHeaderLabel) => {
  dispatch({ type: 'WORKFLOW_COLUMN.PIN', payload: { label } });
};

export {
  workflowTableColumns,
  availableSearchAttributeColumns,
  availableWorkflowColumns,
  pinnedColumnsWidth,
  addColumn,
  removeColumn,
  moveColumn,
  pinColumn,
};
