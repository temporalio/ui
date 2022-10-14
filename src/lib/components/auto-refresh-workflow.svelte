<script lang="ts">
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import { autoRefreshWorkflow } from '$lib/stores/event-view';

  export let onClick: () => void;

  $: active = $autoRefreshWorkflow === 'on';
</script>

<Tooltip bottomLeft text="This page refreshes every 15 seconds">
  <button on:click={onClick} class:active
    ><span class="dot" />{active ? 'on' : 'off'}</button
  >
</Tooltip>

<style lang="postcss">
  button {
    @apply flex h-6 w-12 items-center justify-center gap-1 rounded bg-gray-100 text-[12px] text-gray-500;
  }
  .dot {
    @apply h-1 w-1 rounded-full bg-gray-500;
  }
  .active {
    @apply bg-blue-700 text-white;
  }

  .active .dot {
    @apply bg-white;
  }
</style>
