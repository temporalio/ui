import { derived, type Readable, type Writable } from 'svelte/store';

import { page } from '$app/stores';

import type { Settings } from '$lib/types/global';

import { namespaces } from './namespaces';
import { persistStore } from './persist-store';
import { customSearchAttributes } from './search-attributes';

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
type AnyWorkflowHeaderLabel = WorkflowHeaderLabel | (string & {});

export type ConfigurableTableHeader = {
  label: AnyWorkflowHeaderLabel;
  pinned?: boolean;
};

export const TABLE_TYPE = {
  WORKFLOWS: 'workflows',
  SCHEDULES: 'schedules',
  ACTIVITIES: 'activities',
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
      type: 'CONFIGURABLE_COLUMN.MOVE';
      payload: {
        from: number;
        to: number;
        namespace: string;
        table: ConfigurableTableType;
      };
    };

export const DEFAULT_WORKFLOWS_COLUMNS: ConfigurableTableHeader[] = [
  { label: 'Status' },
  { label: 'Workflow ID' },
  { label: 'Run ID' },
  { label: 'Type' },
  { label: 'Start' },
  { label: 'End' },
];

const DEFAULT_AVAILABLE_WORKFLOWS_COLUMNS: ConfigurableTableHeader[] = [
  { label: 'History Size' },
  { label: 'History Length' },
  { label: 'Execution Time' },
  { label: 'Execution Duration' },
  { label: 'State Transitions' },
  { label: 'Task Queue' },
  { label: 'Scheduled By ID' },
  { label: 'Scheduled Start Time' },
  { label: 'Deployment' },
  { label: 'Deployment Version' },
  { label: 'Versioning Behavior' },
  { label: 'Change Version' },
];

const DEFAULT_AVAILABLE_WORKFLOWS_COLUMNS_CORE: ConfigurableTableHeader[] = [
  ...DEFAULT_AVAILABLE_WORKFLOWS_COLUMNS,
  { label: 'Parent Namespace' },
];

const DEFAULT_SCHEDULES_COLUMNS: ConfigurableTableHeader[] = [
  { label: 'Status' },
  { label: 'Schedule ID' },
  { label: 'Workflow Type' },
  { label: 'Recent Runs' },
  { label: 'Upcoming Runs' },
  { label: 'Schedule Spec' },
];

export const ActivityHeaderLabels = [
  'Activity ID',
  'Run ID',
  'Activity Type',
  'Task Queue',
  'Start Time',
  'Close Time',
  'Status',
  'Execution Duration',
  'State Transitions',
] as const;

export type ActivityHeaderLabel = (typeof ActivityHeaderLabels)[number];

export const DEFAULT_ACTIVITIES_COLUMNS: ConfigurableTableHeader[] = [
  { label: 'Status' },
  { label: 'Activity ID' },
  { label: 'Activity Type' },
  { label: 'Task Queue' },
  { label: 'Start Time' },
  { label: 'Close Time' },
];

const DEFAULT_AVAILABLE_ACTIVITIES_COLUMNS: ConfigurableTableHeader[] = [
  { label: 'Run ID' },
  { label: 'Execution Duration' },
  { label: 'State Transitions' },
];

export const persistedWorkflowTableColumns = persistStore<State>(
  'namespace-workflow-table-columns',
  {},
);

export const persistedSchedulesTableColumns = persistStore<State>(
  'namespace-schedules-table-columns',
  {},
);

export const persistedActivitiesTableColumns = persistStore<State>(
  'namespace-activities-table-columns',
  {},
);

export const configurableTableColumns: Readable<TableColumns> = derived(
  [
    namespaces,
    page,
    persistedWorkflowTableColumns,
    persistedSchedulesTableColumns,
    persistedActivitiesTableColumns,
  ],
  ([
    $namespaces,
    $page,
    $persistedWorkflowTableColumns,
    $persistedSchedulesTableColumns,
    $persistedActivitiesTableColumns,
  ]) => {
    const state: TableColumns = {};
    const useOrAddDefaultTableColumnsToNamespace = (
      columns: State,
      namespace: string,
      defaultColumns: ConfigurableTableHeader[],
    ) => {
      if (!columns?.[namespace]?.length) {
        columns[namespace] = [...defaultColumns];
        return columns[namespace];
      }

      return columns[namespace];
    };

    const getTableColumns = (namespace: string) => ({
      workflows: useOrAddDefaultTableColumnsToNamespace(
        $persistedWorkflowTableColumns,
        namespace,
        DEFAULT_WORKFLOWS_COLUMNS,
      ),
      schedules: useOrAddDefaultTableColumnsToNamespace(
        $persistedSchedulesTableColumns,
        namespace,
        DEFAULT_SCHEDULES_COLUMNS,
      ),
      activities: useOrAddDefaultTableColumnsToNamespace(
        $persistedActivitiesTableColumns,
        namespace,
        DEFAULT_ACTIVITIES_COLUMNS,
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

export const availableWorkflowSystemSearchAttributeColumns: (
  namespace: string,
  settings: Settings,
) => Readable<ConfigurableTableHeader[]> = (namespace, settings) =>
  derived(configurableTableColumns, ($configurableTableColumns) =>
    [
      ...DEFAULT_WORKFLOWS_COLUMNS,
      ...(settings?.runtimeEnvironment?.isCloud
        ? DEFAULT_AVAILABLE_WORKFLOWS_COLUMNS
        : DEFAULT_AVAILABLE_WORKFLOWS_COLUMNS_CORE),
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

export const availableActivityColumns: (
  namespace: string,
) => Readable<ConfigurableTableHeader[]> = (namespace) =>
  derived(configurableTableColumns, ($configurableTableColumns) =>
    [
      ...DEFAULT_ACTIVITIES_COLUMNS,
      ...DEFAULT_AVAILABLE_ACTIVITIES_COLUMNS,
    ].filter(
      (header) =>
        !$configurableTableColumns[namespace]?.activities?.some(
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
        })),
  );

const getDefaultColumns = (table: ConfigurableTableType) => {
  switch (table) {
    case TABLE_TYPE.WORKFLOWS:
      return DEFAULT_WORKFLOWS_COLUMNS;
    case TABLE_TYPE.SCHEDULES:
      return DEFAULT_SCHEDULES_COLUMNS;
    case TABLE_TYPE.ACTIVITIES:
      return DEFAULT_ACTIVITIES_COLUMNS;
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
        [namespace]: [...columns, { label }],
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
    case 'CONFIGURABLE_COLUMN.MOVE': {
      const { from, to, namespace } = action.payload;
      const columns = state?.[namespace] ?? DEFAULT_WORKFLOWS_COLUMNS;
      const tempColumns = [...columns];

      tempColumns.splice(to, 0, tempColumns.splice(from, 1)[0]);

      return {
        ...state,
        [namespace]: tempColumns,
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
    case TABLE_TYPE.ACTIVITIES:
      return persistedActivitiesTableColumns;
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
