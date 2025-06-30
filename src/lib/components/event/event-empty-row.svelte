<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isCloud } from '$lib/stores/advanced-visibility';

  export let loading = false;
  export let title = translate('events.empty-state-title');
  export let content = translate('events.empty-state-description');
</script>

<tr class="bg-primary">
  <td colspan={$isCloud ? 5 : 4}>
    {#if loading}
      <Loading />
    {:else}
      <EmptyState {title} {content} />
    {/if}
  </td>
</tr>
