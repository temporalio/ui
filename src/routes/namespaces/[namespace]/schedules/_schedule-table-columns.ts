import DateTimeFormatFilter from '$lib/components/filters/date-time-format.svelte';
import type { TableColumn } from '$lib/components/table/types';
import WorkflowStatus from '$lib/components/workflow-status.svelte';

export const columns: TableColumn[] = [
  {
    key: 'status',
    label: 'Status',
    classes: 'w-28',
    component: WorkflowStatus,
    props: ['status'],
  },
  { key: 'scheduleId', label: 'Schedule ID', classes: 'truncate' },
  { key: 'name', label: 'Workflow Type', classes: 'w-80' },
  {
    key: 'startTime',
    label: 'Recent Runs',
    classes: 'hidden xl:table-cell w-64',
    type: 'dateTime',
    filter: DateTimeFormatFilter,
  },
  {
    key: 'closeTime',
    label: 'Upcoming Runs',
    classes: 'hidden xl:table-cell w-64',
    type: 'dateTime',
  },
];
