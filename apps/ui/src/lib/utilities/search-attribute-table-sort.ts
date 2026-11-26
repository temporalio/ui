import type {
  SearchAttributes,
  SearchAttributeType,
} from '$lib/types/workflows';

import type { QuickFilterColumns } from './query/quick-filter-table';
import type { TableSortColumn, TableSortType } from './table-sort';

export function searchAttributeSortType(
  type?: SearchAttributeType,
): TableSortType | undefined {
  switch (type) {
    case 'Int':
      return 'integer';
    case 'Double':
      return 'number';
    case 'Bool':
      return 'boolean';
    case 'Datetime':
      return 'datetime';
    case 'Keyword':
    case 'Text':
    case 'KeywordList':
      return 'string';
    default:
      return undefined;
  }
}

// Built-in types remain available before search attribute metadata has loaded.
const systemTypes: Record<string, TableSortType> = {
  StartTime: 'datetime',
  CloseTime: 'datetime',
  ExecutionTime: 'datetime',
  ScheduleTime: 'datetime',
  TemporalScheduledStartTime: 'datetime',
  HistorySizeBytes: 'integer',
  HistoryLength: 'integer',
  StateTransitionCount: 'integer',
};

export function searchAttributeSortColumns<T>(
  labels: string[],
  columns: QuickFilterColumns<T>,
  attributes: SearchAttributes,
  overrides: Record<string, TableSortColumn<T>> = {},
): Record<string, TableSortColumn<T>> {
  return Object.fromEntries(
    labels.map((label) => {
      const attribute = columns.attributes[label] ?? label;
      return [
        label,
        overrides[label] ?? {
          getValue: (item: T) => columns.getValue(label, item),
          type:
            searchAttributeSortType(attributes[attribute]) ??
            systemTypes[attribute],
        },
      ];
    }),
  );
}
