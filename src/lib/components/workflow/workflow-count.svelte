<script lang="ts">
  import type { WorkflowStatus as Status } from '$lib/types/workflows';

  import WorkflowStatus from '../workflow-status.svelte';

  export let status: Status | 'all' = 'all';
  export let count = 0;
  export let active = false;
  export let onStatusClick: (status: Status | 'all') => void = () => {};
</script>

<button
  class="count-card flex flex-row lg:flex-col items-center lg:items-end gap-2 lg:gap-0 cursor-pointer py-1 px-2 lg:py-2 lg:px-4 border-2 border-gray-900 rounded-lg bg-white"
  class:active
  on:click={() => onStatusClick(status)}
  on:keypress={() => onStatusClick(status)}
>
  <p class="font-mono text-sm lg:text-lg">{count.toLocaleString()}</p>
  {#if status === 'all'}
    <p class="font-primary text-sm lg:text-lg">All</p>
  {:else}
    <WorkflowStatus {status} />
  {/if}
</button>

<style lang="postcss">
  .active {
    @apply bg-indigo-100;
  }

  .count-card:hover {
    background: linear-gradient(157deg, #e6fffa 0%, #e0eaff 100%);
    box-shadow: 4px 4px 0 0 #000;
  }
</style>
