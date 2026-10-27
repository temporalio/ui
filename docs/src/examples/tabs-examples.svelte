<script lang="ts">
  import { IconCode, IconTable } from '$lib/io/icon';
  import { Tabs, TabsContent, type TabsItem } from '$lib/io-ark/tabs';

  const workflowTabs: TabsItem[] = [
    { value: 'history', label: 'History' },
    { value: 'workers', label: 'Workers' },
    { value: 'pending', label: 'Pending Activities', badge: 3 },
    { value: 'stack-trace', label: 'Stack Trace' },
    { value: 'queries', label: 'Queries', disabled: true },
  ];

  const viewTabs: TabsItem[] = [
    { value: 'table', label: 'Table', Icon: IconTable },
    { value: 'json', label: 'JSON', Icon: IconCode },
  ];

  const inputJson = JSON.stringify({ orderId: 'A-1042', amount: 129 });

  let workflowTab = $state('history');
  let view = $state('table');
</script>

<div class="flex flex-col gap-8">
  <Tabs items={workflowTabs} bind:value={workflowTab} label="Workflow details">
    {#snippet content(item)}
      <p class="text-secondary">
        {#if item.value === 'pending'}
          3 activities are waiting on the orders-task-queue.
        {:else}
          {item.label} for order-fulfillment-7f3a.
        {/if}
      </p>
    {/snippet}
  </Tabs>

  <Tabs
    items={viewTabs}
    bind:value={view}
    variant="enclosed"
    label="Input view"
  >
    <TabsContent value="table">
      <dl class="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1">
        <dt class="text-secondary">orderId</dt>
        <dd>A-1042</dd>
        <dt class="text-secondary">amount</dt>
        <dd>129.00</dd>
      </dl>
    </TabsContent>
    <TabsContent value="json">
      <pre
        class="rounded bg-surface-secondary p-3 font-mono text-xs">{inputJson}</pre>
    </TabsContent>
  </Tabs>
</div>
