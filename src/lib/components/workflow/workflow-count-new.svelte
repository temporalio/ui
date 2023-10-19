<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import { loading, refresh, updating } from '$lib/stores/workflows';

  export let count = 0;
</script>

<Button
  size="xs"
  variant="secondary"
  leadingIcon="retry"
  loading={$loading || $updating}
  {count}
  on:click={() => ($refresh = Date.now())}
/>

<!-- <button
  class="flex cursor-pointer rounded border border-gray-900 bg-white px-1 py-0.5 text-center text-sm text-sm font-medium leading-4 hover:border-indigo-600 hover:text-indigo-600"
  on:click={() => ($refresh = Date.now())}
>
  <p
    class="flex items-center"
    data-testid="workflow-count"
    data-loaded={!$loading && !$updating}
  >
    {#if count > 0}
      {count.toLocaleString()} {translate('new')}
    {/if}
    <Icon name="retry" clas="h-2 w-2" />
  </p>
</button> -->
