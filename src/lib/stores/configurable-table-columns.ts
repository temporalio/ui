import { derived, type Readable, type Writable } from 'svelte/store';

import { page } from '$app/stores';

import type { Settings } from '$lib/types/global';

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
  'Task Queue',
  'Scheduled By ID',
  'Scheduled Start Time',
] as const;

export type WorkflowHeaderLabel = (typeof WorkflowHeaderLabels)[number];

// https://github.com/microsoft/TypeScript/issues/29729
// https://stackoverflow.com/a/61048124
// eslint-disable-next-line @typescript-eslint/ban-types
type AnyWorkflowHeaderLabel = WorkflowHeaderLabel | (string & {});

export type ConfigurableTableHeader = {
  label: AnyWorkflowHeaderLabel;
  pinned: boolean;
};

export const TABLE_TYPE = {
  WORKFLOWS: 'workflows',
  SCHEDULES: 'schedules',
} as const;

type Keys = keyof typeof TABLE_TYPE;
export type ConfigurableTableType = (typeof TABLE_TYPE)[Keys];

type TableColumns = {
  [namespace: string]:
    | {
        [key in ConfigurableTableType]: ConfigurableTableHeader[];
      }
    | undefined;
};

type State = {
  [namespace: string]: ConfigurableTableHeader[] | undefined;
};

type Action =
  | {
      type: 'CONFIGURABLE_COLUMN.ADD';
      payload: {
        label: AnyWorkflowHeaderLabel;
        namespace: string;
        table: ConfigurableTableType;
      };
    }
  | {
      type: 'CONFIGURABLE_COLUMN.REMOVE';
      payload: {
        label: AnyWorkflowHeaderLabel;
        namespace: string;
        table: ConfigurableTableType;
      };
    }
  | {
      type: 'CONFIGURABLE_COLUMN.PIN';
      payload: {
        label: AnyWorkflowHeaderLabel;
        namespace: string;
        table: ConfigurableTableType;
      };
    }
  | {
      type: 'CONFIGURABLE_COLUMN.MOVE';
      payload: {
        from: number;
        to: number;
        namespace: string;
        table: ConfigurableTableType;
      };
    };

const DEFAULT_WORKFLOWS_COLUMNS: ConfigurableTableHeader[] = [
  { label: 'Status', pinned: true },
  { label: 'Workflow ID', pinned: true },
  { label: 'Run ID', pinned: false },
  { label: 'Type', pinned: false },
  { label: 'Start', pinned: false },
  { label: 'End', pinned: false },
];

const DEFAULT_AVAILABLE_WORKFLOWS_COLUMNS: ConfigurableTableHeader[] = [
  { label: 'History Size', pinned: false },
  { label: 'History Length', pinned: false },
  { label: 'Execution Time', pinned: false },
  { label: 'Execution Duration', pinned: false },
  { label: 'State Transitions', pinned: false },
  { label: 'Parent Namespace', pinned: false },
  { label: 'Task Queue', pinned: false },
  { label: 'Scheduled By ID', pinned: false },
  { label: 'Scheduled Start Time', pinned: false },
];

const DEFAULT_SCHEDULES_COLUMNS: ConfigurableTableHeader[] = [
  { label: 'Status', pinned: false },
  { label: 'Schedule ID', pinned: false },
  { label: 'Workflow Type', pinned: false },
  { label: 'Recent Runs', pinned: false },
  { label: 'Upcoming Runs', pinned: false },
  { label: 'Schedule Spec', pinned: false },
];

const isNotParentWorkflowIdColumn = (column: ConfigurableTableHeader) =>
  column.label !== 'Parent Workflow ID';

const getDefaultWorkflowsTableColumns = (): ConfigurableTableHeader[] => {
  let columns: ConfigurableTableHeader[];
  try {
    // try to get the list of columns that was stored last time they interacted
    // with the table before we made it namespace-specific
    const stringifiedOldColumns = window.localStorage.getItem(
      'workflow-table-columns',
    );
    const parsedOldColumns = JSON.parse(stringifiedOldColumns);

    if (stringifiedOldColumns && parsedOldColumns?.length) {
      const filteredOldColumns = parsedOldColumns.filter(
        isNotParentWorkflowIdColumn,
      );
      columns = filteredOldColumns;
    } else {
      columns = DEFAULT_WORKFLOWS_COLUMNS;
    }
  } catch {
    columns = DEFAULT_WORKFLOWS_COLUMNS;
  }

  return columns;
};

export const persistedWorkflowTableColumns = persistStore<State>(
  'namespace-workflow-table-columns',
  {},
);

export const persistedSchedulesTableColumns = persistStore<State>(
  'namespace-schedules-table-columns',
  {},
);

export const configurableTableColumns: Readable<TableColumns> = derived(
  [
    namespaces,
    page,
    persistedWorkflowTableColumns,
    persistedSchedulesTableColumns,
  ],
  ([
    $namespaces,
    $page,
    $persistedWorkflowTableColumns,
    $persistedSchedulesTableColumns,
  ]) => {
    const state: TableColumns = {};
    const useOrAddDefaultTableColumnsToNamespace = (
      columns: State,
      namespace: string,
      defaultColumns: ConfigurableTableHeader[],
      update: (columns: State) => void,
    ) => {
      if (!columns?.[namespace]?.length) {
        columns[namespace] = [...defaultColumns];
        return columns[namespace];
      }
      const filteredColumns = columns[namespace].filter(
        isNotParentWorkflowIdColumn,
      );

      if (filteredColumns.length !== columns[namespace].length) {
        columns[namespace] = filteredColumns;
        update(columns);
      }

      return columns[namespace];
    };

    const getTableColumns = (namespace: string) => ({
      workflows: useOrAddDefaultTableColumnsToNamespace(
        $persistedWorkflowTableColumns,
        namespace,
        getDefaultWorkflowsTableColumns(),
        (columns) => persistedWorkflowTableColumns.set(columns),
      ),
      schedules: useOrAddDefaultTableColumnsToNamespace(
        $persistedSchedulesTableColumns,
        namespace,
        DEFAULT_SCHEDULES_COLUMNS,
        (columns) => persistedSchedulesTableColumns.set(columns),
      ),
    });

    const namespaceColumns =
      $namespaces?.reduce(
        (namespaceToColumnsMap, { namespaceInfo: { name } }): TableColumns => {
          return {
            ...namespaceToColumnsMap,
            [name]: getTableColumns(name),
          };
        },
        state,
      ) ?? {};
    const { namespace: currentNamespace } = $page.params;

    return namespaceColumns[currentNamespace]
      ? namespaceColumns
      : {
          ...namespaceColumns,
          [currentNamespace]: getTableColumns(currentNamespace),
        };
  },
);

export const pinnedColumnsWidth = persistStore<number>(
  'workflow-table-pinned-columns-width',
);

export const availableWorkflowSystemSearchAttributeColumns: (
  namespace: string,
  settings: Settings,
) => Readable<ConfigurableTableHeader[]> = (namespace, settings) =>
  derived(configurableTableColumns, ($configurableTableColumns) =>
    [
      ...DEFAULT_WORKFLOWS_COLUMNS,
      ...(settings?.runtimeEnvironment?.isCloud
        ? DEFAULT_AVAILABLE_WORKFLOWS_COLUMNS.filter(
            (col) => col.label !== 'Parent Namespace',
          )
        : DEFAULT_AVAILABLE_WORKFLOWS_COLUMNS),
    ].filter(
      (header) =>
        !$configurableTableColumns[namespace]?.workflows?.some(
          (column) => column.label === header.label,
        ),
    ),
  );

export const availableScheduleColumns: (
  namespace: string,
) => Readable<ConfigurableTableHeader[]> = (namespace) =>
  derived(configurableTableColumns, ($configurableTableColumns) =>
    [...DEFAULT_SCHEDULES_COLUMNS].filter(
      (header) =>
        !$configurableTableColumns[namespace]?.schedules?.some(
          (column) => column.label === header.label,
        ),
    ),
  );

export const availableCustomSearchAttributeColumns: (
  namespace: string,
  table?: ConfigurableTableType,
) => Readable<ConfigurableTableHeader[]> = (
  namespace: string,
  table: ConfigurableTableType = TABLE_TYPE.WORKFLOWS,
) =>
  derived(
    [customSearchAttributes, configurableTableColumns],
    ([$customSearchAttributes, $configurableTableColumns]) =>
      Object.keys($customSearchAttributes)
        .filter(
          (searchAttribute) =>
            !$configurableTableColumns[namespace]?.[table]?.some(
              (column) => column.label === searchAttribute,
            ),
        )
        .map((key) => ({
          label: key,
          pinned: false,
        })),
  );

const getDefaultColumns = (table: ConfigurableTableType) => {
  switch (table) {
    case TABLE_TYPE.WORKFLOWS:
      return DEFAULT_WORKFLOWS_COLUMNS;
    case TABLE_TYPE.SCHEDULES:
      return DEFAULT_SCHEDULES_COLUMNS;
  }
};

const reducer = (action: Action, state: State): State => {
  const defaultColumns = getDefaultColumns(action.payload.table);
  switch (action.type) {
    case 'CONFIGURABLE_COLUMN.ADD': {
      const { label, namespace } = action.payload;
      const columns = state?.[namespace] ?? defaultColumns;

      return {
        ...state,
        [namespace]: [...columns, { label, pinned: false }],
      };
    }
    case 'CONFIGURABLE_COLUMN.REMOVE': {
      const { label: labelToRemove, namespace } = action.payload;
      const columns = state?.[namespace] ?? defaultColumns;

      return {
        ...state,
        [namespace]: columns.filter(({ label }) => label !== labelToRemove),
      };
    }
    case 'CONFIGURABLE_COLUMN.PIN': {
      const { label: labelToPin, namespace } = action.payload;
      const columns = state?.[namespace] ?? defaultColumns;
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
    case 'CONFIGURABLE_COLUMN.MOVE': {
      const { from, to, namespace } = action.payload;
      const columns = state?.[namespace] ?? DEFAULT_WORKFLOWS_COLUMNS;
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

const getPersistedColumns = (table: ConfigurableTableType): Writable<State> => {
  switch (table) {
    case TABLE_TYPE.WORKFLOWS:
      return persistedWorkflowTableColumns;
    case TABLE_TYPE.SCHEDULES:
      return persistedSchedulesTableColumns;
  }
};

const dispatch = (action: Action) => {
  const columns = getPersistedColumns(action.payload.table);
  columns.update((previousState) => reducer(action, previousState));
};

export const addColumn = (
  label: AnyWorkflowHeaderLabel,
  namespace: string,
  table: ConfigurableTableType,
) => {
  dispatch({
    type: 'CONFIGURABLE_COLUMN.ADD',
    payload: { label, namespace, table },
  });
};

export const removeColumn = (
  label: AnyWorkflowHeaderLabel,
  namespace: string,
  table: ConfigurableTableType,
) => {
  dispatch({
    type: 'CONFIGURABLE_COLUMN.REMOVE',
    payload: { label, namespace, table },
  });
};

export const moveColumn = (
  from: number,
  to: number,
  namespace: string,
  table: ConfigurableTableType,
) => {
  dispatch({
    type: 'CONFIGURABLE_COLUMN.MOVE',
    payload: { from, to, namespace, table },
  });
};

export const pinColumn = (
  label: AnyWorkflowHeaderLabel,
  namespace: string,
  table: ConfigurableTableType,
) => {
  dispatch({
    type: 'CONFIGURABLE_COLUMN.PIN',
    payload: { label, namespace, table },
  });
};
