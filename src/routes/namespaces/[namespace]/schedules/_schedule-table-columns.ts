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
  { key: 'runId', label: 'Schedule ID', classes: 'w-96 truncate' },
  { key: 'name', label: 'Workflow Type' },
  {
    key: 'startTime',
    label: 'Recent Runs',
    classes: 'hidden xl:table-cell',
    type: 'dateTime',
    filter: DateTimeFormatFilter,
  },
  {
    key: 'upcomingRuns',
    label: 'Upcoming Runs',
    classes: 'hidden xl:table-cell',
    type: 'dateTime',
    filter: DateTimeFormatFilter,
  },
];
