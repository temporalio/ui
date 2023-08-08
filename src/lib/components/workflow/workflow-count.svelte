<script lang="ts">
  import type { WorkflowStatus as Status } from '$lib/types/workflows';
  import WorkflowStatus from '../workflow-status.svelte';

  export let status: Status;
  export let count: number = Math.round(Math.random() * 10000);
  export let active = false;
  export let onStatusClick: (status: Status) => void = () => {};
</script>

<div
  class="count-card flex flex-col items-end cursor-pointer py-4 px-5 border-2 border-gray-900 rounded-lg bg-white"
  class:active
  on:click={() => onStatusClick(status)}
  on:keypress={() => onStatusClick(status)}
>
  <p class="noto text-lg">{count.toLocaleString()}</p>
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
