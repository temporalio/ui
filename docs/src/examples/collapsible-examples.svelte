<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import { Collapsible } from '$lib/io-ark/collapsible';

  let maximumAttempts = $state('5');
  const pendingActivities = ['ChargeCard', 'ReserveInventory', 'SendReceipt'];
</script>

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-4">
    <Input
      id="collapsible-workflow-id"
      label="Workflow ID"
      value="order-1042"
    />
    <Collapsible label="Retry policy">
      <Input
        id="collapsible-maximum-attempts"
        label="Maximum attempts"
        bind:value={maximumAttempts}
      />
    </Collapsible>
  </div>

  <Collapsible lazyMount>
    {#snippet trigger(open)}
      <span>{open ? 'Hide' : 'Show'} pending activities</span>
      <span
        class="rounded-full bg-surface-secondary px-2 py-0.5 text-xs text-secondary"
        >{pendingActivities.length}</span
      >
    {/snippet}
    <ul class="list-disc pl-5 text-sm">
      {#each pendingActivities as activity (activity)}
        <li>{activity}</li>
      {/each}
    </ul>
  </Collapsible>

  <Collapsible label="Stack trace" disabled>
    <pre class="text-xs">No stack trace is available.</pre>
  </Collapsible>
</div>
