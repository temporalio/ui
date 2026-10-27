<script lang="ts">
  import { IconAdd } from '$lib/io/icon';
  import { Button } from '$lib/io-ark/button';
  import { Tour, type TourStep } from '$lib/io-ark/tour';

  let open = $state(false);
  let outcome = $state('Not started');
  let filterBar = $state<HTMLElement | null>(null);
  let statusColumn = $state<HTMLElement | null>(null);
  let startButton = $state<HTMLElement | null>(null);

  const workflows = [
    { id: 'order-fulfillment-7f3a', type: 'OrderWorkflow', status: 'Running' },
    { id: 'refund-request-2c91', type: 'RefundWorkflow', status: 'Completed' },
    { id: 'inventory-sync-0d44', type: 'InventoryWorkflow', status: 'Failed' },
  ];

  const steps: TourStep[] = [
    {
      id: 'intro',
      title: 'Welcome to the workflow list',
      description:
        'This short tour shows where to filter executions, check their status, and start new workflows.',
    },
    {
      id: 'filters',
      title: 'Filter executions',
      description:
        'Narrow the list by status, workflow type, or start time. Filters are saved in the URL.',
      target: () => filterBar,
      placement: 'bottom-start',
    },
    {
      id: 'status',
      title: 'Check status at a glance',
      description:
        'Running, completed, and failed executions are labeled so you can spot problems quickly.',
      target: () => statusColumn,
      placement: 'right',
    },
    {
      id: 'start',
      title: 'Start a workflow',
      description:
        'Start a new execution with an input payload and task queue of your choice.',
      target: () => startButton,
      placement: 'left',
    },
  ];
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-wrap items-center gap-3">
    <Button colorScheme="secondary" onclick={() => (open = true)}
      >Start tour</Button
    >
    <p class="text-xs text-secondary" role="status">Tour: {outcome}</p>
  </div>
  <div class="rounded-lg border border-primary bg-surface-primary">
    <div
      class="flex flex-wrap items-center justify-between gap-3 border-b border-primary p-4"
    >
      <div bind:this={filterBar} class="flex flex-wrap items-center gap-2">
        <span
          class="rounded-sm border border-secondary px-2 py-1 text-xs text-primary"
          >Status: Any</span
        >
        <span
          class="rounded-sm border border-secondary px-2 py-1 text-xs text-primary"
          >Type: Any</span
        >
        <span
          class="rounded-sm border border-secondary px-2 py-1 text-xs text-primary"
          >Started: Last 24 hours</span
        >
      </div>
      <span bind:this={startButton} class="inline-flex">
        <Button size="sm" LeadingIcon={IconAdd}>Start workflow</Button>
      </span>
    </div>
    <table class="w-full text-left text-sm">
      <thead class="text-xs text-secondary">
        <tr>
          <th class="px-4 py-2 font-medium" bind:this={statusColumn}>Status</th>
          <th class="px-4 py-2 font-medium">Workflow ID</th>
          <th class="px-4 py-2 font-medium max-sm:hidden">Type</th>
        </tr>
      </thead>
      <tbody>
        {#each workflows as workflow (workflow.id)}
          <tr class="border-t border-primary">
            <td class="px-4 py-2">{workflow.status}</td>
            <td class="px-4 py-2 font-mono text-xs">{workflow.id}</td>
            <td class="px-4 py-2 max-sm:hidden">{workflow.type}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Tour
  {steps}
  bind:open
  onComplete={() => (outcome = 'Completed')}
  onSkip={() => (outcome = 'Skipped')}
  onDismiss={() => (outcome = 'Closed early')}
/>
