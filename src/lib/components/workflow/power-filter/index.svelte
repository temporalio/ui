<script lang="ts">
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowFilters } from '$lib/stores/filters';
  import { savedQueries } from '$lib/stores/saved-queries';

  import DeleteViewModal from './delete-view-modal.svelte';
  import EditViewModal from './edit-view-modal.svelte';
  import Filter from './filter.svelte';
  import ManualQuery from './manual-query.svelte';
  import SaveViewModal from './save-view-modal.svelte';

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

<div>
  <div
    class="flex w-full flex-wrap items-center justify-between gap-2 border border-subtle bg-primary p-1.5"
  >
    <div class="flex grow items-center justify-start gap-2">
      <Icon name="filter-lines" class="text-muted h-4 w-4" />
      <Filter />
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
