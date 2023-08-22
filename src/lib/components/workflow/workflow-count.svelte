<script lang="ts">
  import type { WorkflowStatus as Status } from '$lib/types/workflows';
  
  import WorkflowStatus from '../workflow-status.svelte';

  export let status: Status;
  // TODO: Make this a real count once API is implemented
  export let count: number = Math.round(Math.random() * 10000);
  export let active = false;
  export let onStatusClick: (status: Status) => void = () => {};
</script>

<div
  class="count-card flex flex-row lg:flex-col items-center lg:items-end gap-2 lg:gap-0 cursor-pointer py-1 px-2 lg:py-4 lg:px-5 border-2 border-gray-900 rounded-lg bg-white"
  class:active
  on:click={() => onStatusClick(status)}
  on:keypress={() => onStatusClick(status)}
>
  <p class="noto text-sm lg:text-lg">{count.toLocaleString()}</p>
  <WorkflowStatus {status} />
</div>

<style lang="postcss">
  .active {
    @apply bg-indigo-100;
  }

  .count-card:hover {
    background: linear-gradient(157deg, #e6fffa 0%, #e0eaff 100%);
    box-shadow: 8px 8px 0 0 #000;
  }
</style>
