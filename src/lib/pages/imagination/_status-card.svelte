<script lang="ts">
  import StatusBadge from '$lib/components/workflow-status.svelte';
  import Card from '$lib/holocene/card.svelte';

  export let status: WorkflowStatus;
  export let count: number = 0;
  export let onClick: (status: WorkflowStatus, count: number) => void;
  export let active: boolean = false;
</script>

<button
  class="flex items-center"
  class:active
  on:click={() => onClick(status, count)}
>
  <Card class="card">
    <h3 class="my-1 text-xl">{count.toLocaleString()}</h3>
    <StatusBadge {status} />
  </Card>
</button>

<style lang="postcss">
  .card {
    @apply w-auto text-center h-full;
  }
  .active :global(.card) {
    @apply ease-in duration-300 -translate-y-1 bg-gradient-to-br from-blue-100 to-purple-100;
    box-shadow: 5px 5px #18181b, 5px 5px 0px 3px #18181b;
  }
</style>
