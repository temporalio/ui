<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';

  import { autoRefreshWorkflow } from '$lib/stores/event-view';

  const onClick = () => {
    if ($autoRefreshWorkflow === 'off') {
      $autoRefreshWorkflow = 'on';
    } else {
      $autoRefreshWorkflow = 'off';
    }
  };

  $: active = $autoRefreshWorkflow === 'on';
</script>

<button on:click={onClick} class:active>Auto-refresh</button>

<style lang="postcss">
  button {
    @apply rounded p-2 bg-white text-gray-900;
  }
  .active {
    @apply bg-primary text-white;
  }
</style>
