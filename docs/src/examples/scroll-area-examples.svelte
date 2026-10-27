<script lang="ts">
  import { ScrollArea } from '$lib/io-ark/scroll-area';

  const eventTypes = [
    'WorkflowExecutionStarted',
    'WorkflowTaskScheduled',
    'WorkflowTaskStarted',
    'WorkflowTaskCompleted',
    'ActivityTaskScheduled',
    'ActivityTaskStarted',
    'ActivityTaskCompleted',
    'TimerStarted',
    'TimerFired',
    'WorkflowExecutionSignaled',
  ];
  const events = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    type: eventTypes[index % eventTypes.length],
    time: `09:14:${String(index * 2).padStart(2, '0')}`,
  }));

  const payload = JSON.stringify(
    {
      orderId: 'order-7f3a',
      customer: { id: 'cus_19283', region: 'us-east-1', tier: 'enterprise' },
      items: [{ sku: 'TMP-STARTER-KIT', quantity: 2, unitPrice: 4999 }],
      retryPolicy: {
        initialInterval: '1s',
        backoffCoefficient: 2,
        maximumInterval: '100s',
        maximumAttempts: 5,
      },
    },
    null,
    0,
  );

  const columns = [
    'Workflow ID',
    'Type',
    'Status',
    'Task queue',
    'Start time',
    'Close time',
    'History length',
  ];
  const rows = Array.from({ length: 12 }, (_, index) => [
    `order-fulfillment-${1040 + index}`,
    'OrderFulfillmentWorkflow',
    index % 4 === 0 ? 'Failed' : 'Completed',
    'orders-task-queue',
    `2026-10-27 09:${String(10 + index).padStart(2, '0')}`,
    `2026-10-27 09:${String(12 + index).padStart(2, '0')}`,
    String(40 + index * 3),
  ]);
</script>

<div class="grid grid-cols-1 gap-6">
  <div>
    <h3 class="mb-3 text-sm font-medium">Event history</h3>
    <ScrollArea
      label="Event history"
      maxHeight="16rem"
      class="rounded border border-primary"
    >
      <ol class="divide-y divide-[color:var(--color-border-primary)]">
        {#each events as event (event.id)}
          <li class="flex items-center gap-3 px-3 py-2 text-sm">
            <span class="w-6 text-right font-mono text-xs text-secondary"
              >{event.id}</span
            >
            <span class="flex-1 font-mono text-xs">{event.type}</span>
            <span class="text-xs text-secondary">{event.time}</span>
          </li>
        {/each}
      </ol>
    </ScrollArea>
  </div>

  <div>
    <h3 class="mb-3 text-sm font-medium">Workflow input</h3>
    <ScrollArea
      label="Workflow input payload"
      orientation="horizontal"
      scrollbars="always"
      class="rounded border border-primary bg-surface-secondary"
    >
      <pre class="whitespace-pre p-3 pb-4 font-mono text-xs">{payload}</pre>
    </ScrollArea>
  </div>

  <div>
    <h3 class="mb-3 text-sm font-medium">Recent executions</h3>
    <ScrollArea
      label="Recent executions"
      orientation="both"
      height="14rem"
      class="rounded border border-primary"
    >
      <table class="min-w-[56rem] text-left text-sm">
        <thead class="sticky top-0 bg-surface-secondary">
          <tr>
            {#each columns as column (column)}
              <th class="whitespace-nowrap px-3 py-2 font-medium">{column}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each rows as row (row[0])}
            <tr class="border-t border-primary">
              {#each row as cell, index (index)}
                <td class="whitespace-nowrap px-3 py-2">{cell}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </ScrollArea>
  </div>
</div>
