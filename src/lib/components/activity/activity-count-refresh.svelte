<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { activityRefresh } from '$lib/stores/activities';

  export let count = 0;
</script>

<Button
  size="xs"
  variant="ghost"
  leadingIcon="retry"
  on:click={() => ($activityRefresh = Date.now())}
>
  {#if count > 0}
    +{count.toLocaleString()}
  {:else if count < 0}
    {count.toLocaleString()}
  {/if}
</Button>
