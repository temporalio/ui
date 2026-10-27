<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { IconFilter } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';
  import { Drawer } from '$lib/io-ark/drawer';

  const events = [
    {
      id: 1,
      type: 'WorkflowExecutionStarted',
      time: '2026-10-27 09:14:02 UTC',
      details: { taskQueue: 'orders-task-queue', attempt: 1 },
    },
    {
      id: 5,
      type: 'ActivityTaskScheduled',
      time: '2026-10-27 09:14:03 UTC',
      details: { activityType: 'ChargeCard', startToCloseTimeout: '30s' },
    },
    {
      id: 7,
      type: 'ActivityTaskFailed',
      time: '2026-10-27 09:14:33 UTC',
      details: { failure: 'Card declined', retryState: 'InProgress' },
    },
  ];

  let selected = $state<(typeof events)[number] | undefined>();
  let detailsOpen = $state(false);

  const statuses = ['Running', 'Completed', 'Failed', 'Timed out'] as const;
  let filtersOpen = $state(false);
  let activeStatuses = $state<string[]>(['Running', 'Failed']);
  let appliedStatuses = $state<string[]>(['Running', 'Failed']);

  function showEvent(event: (typeof events)[number]) {
    selected = event;
    detailsOpen = true;
  }
</script>

<div class="flex flex-col gap-6">
  <section class="rounded-lg border border-primary p-6">
    <h3 class="mb-4 text-sm font-medium">Event details side panel</h3>
    <ul class="divide-y divide-primary rounded border border-primary">
      {#each events as event (event.id)}
        <li class="flex items-center justify-between gap-4 px-4 py-2">
          <span class="font-mono text-xs">{event.id} · {event.type}</span>
          <Button size="sm" colorScheme="ghost" onclick={() => showEvent(event)}
            >Details</Button
          >
        </li>
      {/each}
    </ul>
    <Drawer
      bind:open={detailsOpen}
      title={selected?.type ?? 'Event'}
      description={selected ? `Event ${selected.id} · ${selected.time}` : ''}
    >
      {#if selected}
        <dl class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
          {#each Object.entries(selected.details) as [key, value] (key)}
            <dt class="text-secondary">{key}</dt>
            <dd class="font-mono">{value}</dd>
          {/each}
        </dl>
      {/if}
    </Drawer>
  </section>

  <section class="rounded-lg border border-primary p-6">
    <h3 class="mb-4 text-sm font-medium">Bottom sheet with filters</h3>
    <div class="flex flex-wrap items-center gap-4">
      <Drawer
        bind:open={filtersOpen}
        placement="bottom"
        size="sm"
        title="Filter workflows"
        description="Show workflows in the payments-prod namespace with these statuses."
        onOpenChange={(open) => open && (activeStatuses = [...appliedStatuses])}
      >
        {#snippet trigger(props)}
          <Button {...props} colorScheme="secondary" LeadingIcon={IconFilter}
            >Filters</Button
          >
        {/snippet}
        <div class="flex flex-col gap-3">
          {#each statuses as status (status)}
            <Checkbox
              id="drawer-status-{status}"
              label={status}
              value={status}
              bind:group={activeStatuses}
            />
          {/each}
        </div>
        {#snippet footer()}
          <Button colorScheme="tertiary" onclick={() => (activeStatuses = [])}
            >Clear</Button
          >
          <Button
            onclick={() => {
              appliedStatuses = [...activeStatuses];
              filtersOpen = false;
            }}>Apply filters</Button
          >
        {/snippet}
      </Drawer>
      <p role="status" class="text-xs text-secondary">
        {appliedStatuses.length
          ? `Showing ${appliedStatuses.join(', ')}`
          : 'Showing all statuses'}
      </p>
    </div>
  </section>
</div>
