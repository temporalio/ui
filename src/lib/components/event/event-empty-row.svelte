<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';

  export let loading = false;
</script>

<tr class="row">
  <td colspan="6">
    {#if loading}
      <Loading />
    {:else}
      <EmptyState
        title={translate('events', 'empty-state-title')}
        content={translate('events', 'empty-state-description')}
      />
    {/if}
  </td>
</tr>

<style lang="postcss">
  .row {
    @apply border-2 border-gray-900 p-2 text-center text-sm;
  }
</style>
