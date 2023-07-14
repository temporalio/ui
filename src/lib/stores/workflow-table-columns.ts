import { derived, type Readable } from 'svelte/store';

import { page } from '$app/stores';

import { namespaces } from './namespaces';
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

type State = {
  [namespace: string]: WorkflowHeader[] | undefined;
};

type Action =
  | {
      type: 'WORKFLOW_COLUMN.ADD';
      payload: { label: AnyWorkflowHeaderLabel; namespace: string };
    }
  | {
      type: 'WORKFLOW_COLUMN.REMOVE';
      payload: { label: AnyWorkflowHeaderLabel; namespace: string };
    }
  | {
      type: 'WORKFLOW_COLUMN.PIN';
      payload: { label: AnyWorkflowHeaderLabel; namespace: string };
    }
  | {
      type: 'WORKFLOW_COLUMN.MOVE';
      payload: { from: number; to: number; namespace: string };
    };

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

export const getDefaultColumns = (): WorkflowHeader[] => {
  let columns: WorkflowHeader[];
  try {
    // try to get the list of columns that was stored last time they interacted
    // with the table before we made it namespace-specific
    const stringifiedOldColumns = window.localStorage.getItem(
      'workflow-table-columns',
    );
    const parsedOldColumns = JSON.parse(stringifiedOldColumns);

    if (stringifiedOldColumns && parsedOldColumns?.length) {
      columns = parsedOldColumns;
    } else {
      columns = DEFAULT_COLUMNS;
    }
  } catch {
    columns = DEFAULT_COLUMNS;
  }

  return columns;
};

export const persistedWorkflowTableColumns = persistStore<State>(
  'namespace-workflow-table-columns',
  {},
);

export const workflowTableColumns: Readable<State> = derived(
  [namespaces, page, persistedWorkflowTableColumns],
  ([$namespaces, $page, $persistedWorkflowTableColumns]) => {
    const state: State = {};

    const useOrAddDefaultTableColumnsToNamespace = (
      columns: State,
      namespace: string,
    ) => {
      if (!columns?.[namespace]?.length) {
        columns[namespace] = [...getDefaultColumns()];
        return columns[namespace];
      }
      return columns[namespace];
    };

    const namespaceColumns =
      $namespaces?.reduce(
        (namespaceToColumnsMap, { namespaceInfo: { name } }) => {
          return {
            ...namespaceToColumnsMap,
            [name]: useOrAddDefaultTableColumnsToNamespace(
              $persistedWorkflowTableColumns,
              name,
            ),
          };
        },
        state,
      ) ?? {};
    const { namespace: currentNamespace } = $page.params;

    return namespaceColumns[currentNamespace]
      ? namespaceColumns
      : {
          ...namespaceColumns,
          [currentNamespace]: useOrAddDefaultTableColumnsToNamespace(
            $persistedWorkflowTableColumns,
            currentNamespace,
          ),
        };
  },
);

export const pinnedColumnsWidth = persistStore<number>(
  'workflow-table-pinned-columns-width',
);

export const availableSystemSearchAttributeColumns: (
  namespace: string,
) => Readable<WorkflowHeader[]> = (namespace) =>
  derived(workflowTableColumns, ($workflowTableColumns) =>
    [...DEFAULT_COLUMNS, ...DEFAULT_AVAILABLE_COLUMNS].filter(
      (header) =>
        !$workflowTableColumns[namespace]?.some(
          (column) => column.label === header.label,
        ),
    ),
  );

export const availableCustomSearchAttributeColumns: (
  namespace: string,
) => Readable<WorkflowHeader[]> = (namespace: string) =>
  derived(
    [customSearchAttributes, workflowTableColumns],
    ([$customSearchAttributes, $workflowTableColumns]) =>
      Object.keys($customSearchAttributes)
        .filter(
          (searchAttribute) =>
            !$workflowTableColumns[namespace]?.some(
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
      const { label, namespace } = action.payload;
      const columns = state?.[namespace] ?? DEFAULT_COLUMNS;

      return {
        ...state,
        [namespace]: [...columns, { label, pinned: false }],
      };
    }
    case 'WORKFLOW_COLUMN.REMOVE': {
      const { label: labelToRemove, namespace } = action.payload;
      const columns = state?.[namespace] ?? DEFAULT_COLUMNS;

      return {
        ...state,
        [namespace]: columns.filter(({ label }) => label !== labelToRemove),
      };
    }
    case 'WORKFLOW_COLUMN.PIN': {
      const { label: labelToPin, namespace } = action.payload;
      const columns = state?.[namespace] ?? DEFAULT_COLUMNS;
      const index = columns.findIndex(({ label }) => label === labelToPin);

      const isPinned = columns[index].pinned;

      let lastPinned = -1;
      for (let i = columns.length - 1; i >= 0; i--) {
        if (columns[i].pinned) {
          lastPinned = i;
          break;
        }
      }

      const newColumns = [...columns];
      newColumns[index].pinned = !isPinned;

      if (index > lastPinned && !isPinned) {
        newColumns.splice(lastPinned + 1, 0, newColumns.splice(index, 1)[0]);
      } else if (index < lastPinned && isPinned) {
        newColumns.splice(lastPinned, 0, newColumns.splice(index, 1)[0]);
      }

      return {
        ...state,
        [namespace]: newColumns,
      };
    }
    case 'WORKFLOW_COLUMN.MOVE': {
      const { from, to, namespace } = action.payload;
      const columns = state?.[namespace] ?? DEFAULT_COLUMNS;
      const isPinned = columns[from].pinned;

      let lastPinned = 0;
      for (let i = columns.length - 1; i >= 0; i--) {
        if (columns[i].pinned) {
          lastPinned = i;
          break;
        }
      }

      const tempColumns = [...columns];
      if (to <= lastPinned && !isPinned) {
        tempColumns[from].pinned = true;
      } else if (to > lastPinned && isPinned) {
        tempColumns[from].pinned = false;
      }

      tempColumns.splice(to, 0, tempColumns.splice(from, 1)[0]);

      return {
        ...state,
        [namespace]: tempColumns.map((c, idx) =>
          idx > MAX_PINNED_COLUMNS - 1 ? { ...c, pinned: false } : c,
        ),
      };
    }
    default:
      return state;
  }
};

const dispatch = (action: Action) => {
  persistedWorkflowTableColumns.update((previousState) =>
    reducer(action, previousState),
  );
};

export const addColumn = (label: AnyWorkflowHeaderLabel, namespace: string) => {
  dispatch({ type: 'WORKFLOW_COLUMN.ADD', payload: { label, namespace } });
};

export const removeColumn = (
  label: AnyWorkflowHeaderLabel,
  namespace: string,
) => {
  dispatch({ type: 'WORKFLOW_COLUMN.REMOVE', payload: { label, namespace } });
};

export const moveColumn = (from: number, to: number, namespace: string) => {
  dispatch({ type: 'WORKFLOW_COLUMN.MOVE', payload: { from, to, namespace } });
};

export const pinColumn = (label: AnyWorkflowHeaderLabel, namespace: string) => {
  dispatch({ type: 'WORKFLOW_COLUMN.PIN', payload: { label, namespace } });
};
