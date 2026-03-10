<script lang="ts">
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import { refresh } from '$lib/stores/workflows';

  let {
    count = 0,
    expanded = false,
    class: className = '',
  }: {
    count?: number;
    expanded?: boolean;
    class?: ClassNameValue;
  } = $props();

  let lastRefreshedCount = $state(count);
  const delta = $derived(count - lastRefreshedCount);
</script>

<Button
  size="xs"
  class={merge('w-full', !expanded && 'h-fit flex-wrap gap-1', className)}
  variant="secondary"
  leadingIcon="retry"
  data-testid="refresh-task-failures-button"
  data-track-name="refresh-task-failures-button"
  data-track-intent="action"
  data-track-text="refresh"
  on:click={() => {
    lastRefreshedCount = count;
    $refresh = Date.now();
  }}
>
  <span class="truncate">
    {#if delta > 0}
      +{delta.toLocaleString()}
    {:else if delta < 0}
      {delta.toLocaleString()}
    {/if}
  </span>
</Button>
