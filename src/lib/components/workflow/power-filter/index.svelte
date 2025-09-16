<script lang="ts">
  import { page } from '$app/state';

  import DeleteViewModal from '$lib/components/search-attribute-filter/delete-view-modal.svelte';
  import EditViewModal from '$lib/components/search-attribute-filter/edit-view-modal.svelte';
  import SaveViewModal from '$lib/components/search-attribute-filter/save-view-modal.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { savedQueries } from '$lib/stores/saved-queries';

  import Filter from './filter/index.svelte';
  import ManualQuery from './manual-query.svelte';
  import Search from './search.svelte';

  let view: 'filter' | 'search' = $state('filter');
  let query = $state('');

  let viewManualQuery = $state(false);
  let saveViewModalOpen = $state(false);
  let editViewModalOpen = $state(false);
  let deleteViewModalOpen = $state(false);

  const namespace = $derived(page.params.namespace);
  const searchParamQuery = $derived(page.url.searchParams.get('query'));
  const savedQueryView = $derived(
    $savedQueries[namespace]?.find((q) => q.query === searchParamQuery),
  );
</script>

{#snippet viewToggleButtons()}
  <div class="flex items-center gap-1 border-r border-subtle pr-1">
    <Button
      variant={view === 'search' ? 'primary' : 'ghost'}
      size="xs"
      leadingIcon="rocket-ship"
      on:click={() => (view = 'search')}
    />
    <Button
      variant={view === 'filter' ? 'primary' : 'ghost'}
      size="xs"
      leadingIcon="filter"
      on:click={() => (view = 'filter')}
    />
  </div>
{/snippet}

{#snippet actionToggleButtons()}
  <div class="flex items-center gap-1">
    <Button
      variant="ghost"
      size="xs"
      leadingIcon="json"
      on:click={() => (viewManualQuery = !viewManualQuery)}
    />
    <Button variant="primary" size="xs">{translate('common.save')}</Button>
    <Button variant="secondary" size="xs">{translate('common.discard')}</Button>
  </div>
{/snippet}

{#snippet content()}
  {#if view === 'search'}
    <Search bind:query />
  {:else}
    <Filter />
  {/if}
{/snippet}

<div>
  <div
    class="flex w-full items-center justify-between gap-2 border border-subtle bg-primary p-1.5"
  >
    {@render viewToggleButtons()}
    {@render content()}
    {@render actionToggleButtons()}
  </div>
  {#if viewManualQuery}
    <ManualQuery />
  {/if}
</div>
<SaveViewModal bind:open={saveViewModalOpen} />
<EditViewModal view={savedQueryView} bind:open={editViewModalOpen} />
<DeleteViewModal view={savedQueryView} bind:open={deleteViewModalOpen} />
