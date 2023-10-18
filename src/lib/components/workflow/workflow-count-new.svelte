<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Spinner from '$lib/holocene/icon/svg/spinner.svelte';
  import { translate } from '$lib/i18n/translate';
  import { loading, refresh, updating } from '$lib/stores/workflows';

  export let count = 0;
</script>

<button
  class="flex cursor-pointer rounded border border-gray-900 bg-white px-1 py-0.5 text-center text-sm text-sm font-medium leading-4 hover:border-indigo-600 hover:text-indigo-600"
  on:click={() => ($refresh = Date.now())}
>
  <p
    class="flex items-center"
    data-testid="workflow-count"
    data-loaded={!$loading && !$updating}
  >
    {#if $loading || $updating}
      <Spinner class="h-4 w-4 animate-spin" />
    {:else if count > 0}
      {count.toLocaleString()} {translate('new')}
    {/if}
    <Icon name="retry" clas="h-2 w-2" />
  </p>
</button>
