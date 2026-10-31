import type { SearchAttributes } from '$lib/types/workflows';
import { getColumnFilter } from '$lib/utilities/query/quick-filter-table';

export const SCHEDULE_COLUMN_ATTRIBUTE: Record<string, string> = {
  'Schedule ID': 'ScheduleId',
};

export const getScheduleColumnFilter = (
  label: string,
  attributes: SearchAttributes,
) =>
  getColumnFilter({ attributes: SCHEDULE_COLUMN_ATTRIBUTE }, label, attributes);
