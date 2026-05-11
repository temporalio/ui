<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isCloud } from '$lib/stores/advanced-visibility';

  let {
    loading = false,
    title = translate('events.empty-state-title'),
    content = translate('events.empty-state-description'),
  }: {
    loading?: boolean;
    title?: string;
    content?: string;
  } = $props();
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
