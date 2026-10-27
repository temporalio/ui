<script lang="ts">
  import { Listbox, type ListboxItem } from '$lib/io-poc/listbox';

  const workers: ListboxItem[] = [
    {
      label: 'orders-worker-7f9c',
      value: 'orders-worker-7f9c',
      description: 'Build 2026.10.21 · polled 2s ago',
    },
    {
      label: 'orders-worker-3a1d',
      value: 'orders-worker-3a1d',
      description: 'Build 2026.10.21 · polled 5s ago',
    },
    {
      label: 'orders-worker-b82e',
      value: 'orders-worker-b82e',
      description: 'Build 2026.10.14 · not polling',
      disabled: true,
    },
  ];

  const searchAttributes: ListboxItem[] = [
    { label: 'WorkflowType', value: 'WorkflowType', group: 'System' },
    { label: 'ExecutionStatus', value: 'ExecutionStatus', group: 'System' },
    { label: 'StartTime', value: 'StartTime', group: 'System' },
    { label: 'CloseTime', value: 'CloseTime', group: 'System' },
    { label: 'TaskQueue', value: 'TaskQueue', group: 'System' },
    { label: 'CustomerId', value: 'CustomerId', group: 'Custom' },
    { label: 'OrderTotal', value: 'OrderTotal', group: 'Custom' },
    { label: 'Region', value: 'Region', group: 'Custom' },
  ];

  let worker = $state<string[]>(['orders-worker-7f9c']);
  let columns = $state<string[]>(['WorkflowType', 'ExecutionStatus']);
  let period = $state<string[]>(['24h']);
</script>

<div class="grid gap-6 rounded-lg border border-primary p-6 md:grid-cols-2">
  <Listbox
    label="Worker"
    items={workers}
    bind:value={worker}
    helperText="Shows recent activity for the selected worker."
  />
  <Listbox
    label="Columns"
    items={searchAttributes}
    bind:value={columns}
    selectionMode="multiple"
    filterable
    filterPlaceholder="Filter search attributes"
    helperText="{columns.length} selected"
  />
  <Listbox
    label="Time range"
    items={[
      { label: 'Last hour', value: '1h' },
      { label: 'Last 24 hours', value: '24h' },
      { label: 'Last 7 days', value: '7d' },
      { label: 'Last 30 days', value: '30d' },
    ]}
    bind:value={period}
    orientation="horizontal"
    class="md:col-span-2"
  />
</div>
