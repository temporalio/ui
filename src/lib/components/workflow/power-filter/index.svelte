<script lang="ts">
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowFilters } from '$lib/stores/filters';
  import { savedQueries } from '$lib/stores/saved-queries';

  import DeleteViewModal from './delete-view-modal.svelte';
  import EditViewModal from './edit-view-modal.svelte';
  import Filter from './filter.svelte';
  import ManualQuery from './manual-query.svelte';
  import SaveViewModal from './save-view-modal.svelte';
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
  <div class="flex items-center gap-1 border-r border-subtle pr-2">
    <Button
      variant={view === 'search' ? 'secondary' : 'ghost'}
      size="xs"
      leadingIcon="rocket-ship"
      on:click={() => (view = 'search')}
    />
    <Button
      variant={view === 'filter' ? 'secondary' : 'ghost'}
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
    <Button
      variant="primary"
      size="xs"
      disabled={!$workflowFilters.length}
      on:click={() => (saveViewModalOpen = true)}
      >{translate('common.save')}</Button
    >
    <Button
      variant="secondary"
      size="xs"
      disabled={!savedQueryView}
      on:click={() => (deleteViewModalOpen = true)}
      >{translate('common.discard')}</Button
    >
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
    <div class="flex grow items-center justify-start gap-2">
      {@render viewToggleButtons()}
      {@render content()}
    </div>
    {@render actionToggleButtons()}
  </div>
  {#if viewManualQuery}
    <ManualQuery />
  {/if}
</div>
<SaveViewModal bind:open={saveViewModalOpen} />
<EditViewModal view={savedQueryView} bind:open={editViewModalOpen} />
<DeleteViewModal view={savedQueryView} bind:open={deleteViewModalOpen} />
