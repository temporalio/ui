<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { loading, refresh, updating } from '$lib/stores/workflows';

  let { count = 0 } = $props();
</script>

<Button
  size="xs"
  variant="ghost"
  leadingIcon="retry"
  loading={$loading || $updating}
  onclick={() => ($refresh = Date.now())}
>
  {#if count > 0}
    +{count.toLocaleString()}
  {:else if count < 0}
    {count.toLocaleString()}
  {/if}
</Button>
