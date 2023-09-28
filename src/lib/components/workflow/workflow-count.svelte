<script lang="ts">
  import type { WorkflowStatus as Status } from '$lib/types/workflows';

  import WorkflowStatus from '../workflow-status.svelte';

  export let status: Status;
  // TODO: Make this a real count once API is implemented
  export let count: number = Math.round(Math.random() * 10000);
  export let active = false;
  export let onStatusClick: (status: Status) => void = () => {};
</script>

<button
  class="count-card flex cursor-pointer flex-row items-center gap-2 rounded-lg border-2 border-gray-900 bg-white py-1 px-2 lg:flex-col lg:items-end lg:gap-0 lg:py-4 lg:px-5"
  class:active
  on:click={() => onStatusClick(status)}
  on:keypress={() => onStatusClick(status)}
>
  <p class="font-mono text-sm lg:text-lg">{count.toLocaleString()}</p>
  <WorkflowStatus {status} />
</button>

<style lang="postcss">
  .active {
    @apply bg-indigo-100;
  }

  .count-card:hover {
    background: linear-gradient(157deg, #e6fffa 0%, #e0eaff 100%);
    box-shadow: 8px 8px 0 0 #000;
  }
</style>
