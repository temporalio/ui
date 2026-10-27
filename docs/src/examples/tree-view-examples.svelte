<script lang="ts">
  import { IconFolders, IconPlay } from '$lib/io/icon';
  import { TreeView, type TreeViewNode } from '$lib/io-poc/tree-view';

  const workflows: TreeViewNode[] = [
    {
      id: 'order-fulfillment-7f3a',
      label: 'order-fulfillment-7f3a',
      Icon: IconPlay,
      children: [
        {
          id: 'charge-payment-91c2',
          label: 'charge-payment-91c2',
          Icon: IconPlay,
        },
        {
          id: 'reserve-inventory-0b8e',
          label: 'reserve-inventory-0b8e',
          Icon: IconPlay,
          children: [
            {
              id: 'warehouse-east-4d1f',
              label: 'warehouse-east-4d1f',
              Icon: IconPlay,
            },
            {
              id: 'warehouse-west-6a27',
              label: 'warehouse-west-6a27',
              Icon: IconPlay,
            },
          ],
        },
        {
          id: 'ship-order-3e55',
          label: 'ship-order-3e55',
          Icon: IconPlay,
        },
      ],
    },
  ];

  const statuses: Record<string, string> = {
    'order-fulfillment-7f3a': 'Running',
    'charge-payment-91c2': 'Completed',
    'reserve-inventory-0b8e': 'Running',
    'warehouse-east-4d1f': 'Completed',
    'warehouse-west-6a27': 'Failed',
    'ship-order-3e55': 'Pending',
  };

  const namespaces: TreeViewNode[] = [
    {
      id: 'payments-prod',
      label: 'payments-prod',
      Icon: IconFolders,
      children: [
        { id: 'payments-prod/charges', label: 'charges' },
        { id: 'payments-prod/refunds', label: 'refunds' },
        { id: 'payments-prod/payouts', label: 'payouts' },
      ],
    },
    {
      id: 'orders-prod',
      label: 'orders-prod',
      Icon: IconFolders,
      children: [
        { id: 'orders-prod/fulfillment', label: 'fulfillment' },
        { id: 'orders-prod/notifications', label: 'notifications' },
      ],
    },
    {
      id: 'legacy-billing',
      label: 'legacy-billing',
      Icon: IconFolders,
      disabled: true,
      children: [{ id: 'legacy-billing/invoices', label: 'invoices' }],
    },
  ];

  let workflowSelection = $state<string[]>(['reserve-inventory-0b8e']);
  let workflowExpanded = $state<string[]>([
    'order-fulfillment-7f3a',
    'reserve-inventory-0b8e',
  ]);
  let queueSelection = $state<string[]>([]);
</script>

<div class="grid gap-8 md:grid-cols-2">
  <div class="flex flex-col gap-3">
    <TreeView
      label="Workflow and child workflows"
      nodes={workflows}
      bind:selectedValue={workflowSelection}
      bind:expandedValue={workflowExpanded}
    >
      {#snippet item(node)}
        {#if node.Icon}
          <node.Icon width={16} height={16} class="shrink-0 text-secondary" />
        {/if}
        <span class="truncate font-mono text-xs">{node.label}</span>
        <span class="ml-auto shrink-0 text-xs font-normal text-secondary"
          >{statuses[node.id]}</span
        >
      {/snippet}
    </TreeView>
    <p class="text-xs text-secondary" role="status">
      Selected: {workflowSelection.join(', ') || 'none'}
    </p>
  </div>
  <div class="flex flex-col gap-3">
    <TreeView
      label="Task queues by namespace"
      nodes={namespaces}
      selectionMode="multiple"
      bind:selectedValue={queueSelection}
    />
    <p class="text-xs text-secondary" role="status">
      {queueSelection.length}
      {queueSelection.length === 1 ? 'item' : 'items'} selected
    </p>
  </div>
</div>
