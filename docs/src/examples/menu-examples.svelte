<script lang="ts">
  import {
    IconDownload,
    IconEllipsisVertical,
    IconRetry,
    IconTemporalSignal,
    IconTrash,
  } from '$lib/io/icon';
  import { Button } from '$lib/io-poc/button';
  import { Menu, type MenuEntry } from '$lib/io-poc/menu';

  let lastAction = $state('None');
  let columns = $state({
    status: true,
    type: true,
    startTime: true,
    taskQueue: false,
  });
  let sort = $state('newest');

  const rowActions: MenuEntry[] = [
    { value: 'signal', label: 'Send signal', Icon: IconTemporalSignal },
    {
      value: 'reset',
      label: 'Reset',
      description: 'Replay from an earlier event',
      Icon: IconRetry,
    },
    {
      type: 'submenu',
      value: 'export',
      label: 'Export history',
      Icon: IconDownload,
      items: [
        { value: 'export-json', label: 'JSON' },
        { value: 'export-csv', label: 'CSV' },
      ],
    },
    { type: 'separator' },
    { value: 'cancel', label: 'Request cancellation' },
    { value: 'terminate', label: 'Terminate', Icon: IconTrash, danger: true },
  ];

  const columnLabels = {
    status: 'Status',
    type: 'Workflow type',
    startTime: 'Start time',
    taskQueue: 'Task queue',
  } as const;

  const viewItems: MenuEntry[] = $derived([
    {
      type: 'group',
      label: 'Columns',
      items: (Object.keys(columnLabels) as (keyof typeof columnLabels)[]).map(
        (key) => ({
          type: 'checkbox' as const,
          value: key,
          label: columnLabels[key],
          checked: columns[key],
          onCheckedChange: (checked: boolean) => (columns[key] = checked),
        }),
      ),
    },
    { type: 'separator' },
    {
      type: 'radio',
      label: 'Sort by',
      value: sort,
      options: [
        { value: 'newest', label: 'Newest first' },
        { value: 'oldest', label: 'Oldest first' },
        { value: 'status', label: 'Status' },
      ],
      onValueChange: (value) => (sort = value),
    },
  ]);

  const visibleColumns = $derived(
    (Object.keys(columns) as (keyof typeof columns)[])
      .filter((key) => columns[key])
      .map((key) => columnLabels[key])
      .join(', '),
  );
</script>

<div class="flex flex-col gap-6">
  <div class="flex flex-wrap items-center gap-4">
    <span class="font-mono text-sm">order-fulfillment-7f3a</span>
    <Menu
      items={rowActions}
      placement="bottom-end"
      onSelect={(value) => (lastAction = value)}
    >
      {#snippet trigger(props)}
        <Button
          {...props}
          colorScheme="ghost"
          size="sm"
          LeadingIcon={IconEllipsisVertical}
          aria-label="Workflow actions"
          tracking={false}
        />
      {/snippet}
    </Menu>
    <p role="status" class="text-xs text-secondary">
      Last action: {lastAction}
    </p>
  </div>
  <div class="flex flex-wrap items-center gap-4">
    <Menu label="View" items={viewItems} triggerSize="sm" />
    <p class="text-xs text-secondary">
      Columns: {visibleColumns || 'none'} · Sort: {sort}
    </p>
  </div>
</div>
