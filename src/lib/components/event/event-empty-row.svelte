<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';

  export let loading = false;
  export let title = translate('events.empty-state-title');
  export let content = translate('events.empty-state-description');
</script>

{#if loading}
  <Loading />
{:else}
  <EmptyState {title} {content} />
{/if}
