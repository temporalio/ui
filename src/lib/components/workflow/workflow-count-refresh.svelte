<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { loading, refresh, updating } from '$lib/stores/workflows';

  export let count = 0;
  export let showLoading = true;
</script>

<Button
  size="xs"
  variant="ghost"
  leadingIcon="retry"
  loading={showLoading && ($loading || $updating)}
  on:click={() => ($refresh = Date.now())}
>
  {#if count > 0}
    +{count.toLocaleString()}
  {/if}
</Button>
