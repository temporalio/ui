<script lang="ts">
  import { Combobox, type ComboboxItem } from '$lib/io-ark/combobox';

  const namespaces: ComboboxItem[] = [
    { label: 'default', value: 'default' },
    { label: 'orders-production', value: 'orders-production' },
    { label: 'orders-staging', value: 'orders-staging' },
    { label: 'payments-production', value: 'payments-production' },
    { label: 'archived-2023', value: 'archived-2023', disabled: true },
  ];

  const taskQueues = [
    'order-fulfillment',
    'payment-processing',
    'inventory-sync',
    'email-notifications',
    'fraud-review',
  ];

  let namespace = $state(['orders-production']);
  let queues = $state(['order-fulfillment', 'payment-processing']);
</script>

<div class="grid gap-6 sm:grid-cols-2">
  <div class="rounded-lg border border-primary p-6">
    <Combobox
      label="Namespace"
      helperText="Workflows are listed for the selected namespace."
      items={namespaces}
      bind:value={namespace}
      placeholder="Search namespaces"
    />
  </div>
  <div class="rounded-lg border border-primary p-6">
    <Combobox
      label="Task queues"
      items={taskQueues}
      multiple
      bind:value={queues}
      placeholder="Add task queues"
    />
  </div>
  <div class="rounded-lg border border-primary p-6">
    <Combobox
      label="Retry policy"
      items={['Default', 'Exponential backoff', 'No retries']}
      value={['Default']}
      disabled
      helperText="Retry policies are set by the workflow definition."
    />
  </div>
  <div class="rounded-lg border border-primary p-6">
    <Combobox
      label="Worker build ID"
      items={[]}
      required
      error="No build IDs are registered for this task queue."
      emptyText="No build IDs found"
      placeholder="Search build IDs"
    />
  </div>
</div>
