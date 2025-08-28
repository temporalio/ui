<script lang="ts" module>
  import { writable, type Writable } from 'svelte/store';

  import { setContext } from 'svelte';

  export const FILTER_CONTEXT = 'filter-context';
  export interface FilterContext {
    filter: Writable<SearchAttributeFilter>;
    handleSubmit: () => void;
    resetFilter: () => void;
  }
</script>

<script lang="ts">
  import { page } from '$app/state';

  import FilterList from '$lib/components/query-palette/search-attribute-filter/filter-list.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import { type SavedQuery as SQ } from '$lib/stores/saved-queries';
  import { refresh } from '$lib/stores/workflows';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import {
    combineFilters,
    emptyFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import SavedQuery from './save-query.svelte';
  import Filter from './search-attribute-filter/filter.svelte';

  interface Props {
    open?: boolean;
    editingQuery: SQ | undefined;
  }
  const { copy, copied } = copyToClipboard();

  let { open = $bindable(false), editingQuery = $bindable(undefined) }: Props =
    $props();

  const query = $derived(page.url.searchParams.get('query') || '');
  const filter = writable<SearchAttributeFilter>(emptyFilter());

  setContext<FilterContext>(FILTER_CONTEXT, {
    filter,
    handleSubmit,
    resetFilter,
  });

  function onSearch() {
    const searchQuery = toListWorkflowQueryFromFilters(
      combineFilters($workflowFilters),
    );

    if (searchQuery && searchQuery === query) {
      $refresh = Date.now();
    } else {
      updateQueryParameters({
        url: page.url,
        parameter: 'query',
        value: searchQuery,
        allowEmpty: true,
        clearParameters: [currentPageKey],
      });
    }
  }

  function resetFilter() {
    filter.set(emptyFilter());
  }

  function handleSubmit() {
    $workflowFilters = [...$workflowFilters, $filter];
    filter.set(emptyFilter());
    onSearch();
  }

  function close() {
    editingQuery = undefined;
    const modal = document.getElementById('command-palette');
    if (modal) {
      modal.classList.add('closing');
      setTimeout(() => {
        open = false;
        modal.classList.remove('closing');
      }, 50);
    } else {
      open = false;
    }
  }

  function setFilter(_filter: SearchAttributeFilter) {
    filter.set(_filter);
  }

  function copyShareableLink(e: MouseEvent) {
    const shareableLink =
      page.url.toString() + '&savedQuery=' + editingQuery.name;
    copy(e, shareableLink);
  }

  $effect(() => {
    if (!open && editingQuery) {
      editingQuery = undefined;
    }
  });
</script>

<Drawer
  bind:open
  position="right"
  class="w-full max-w-[1000px]"
  id="command-palette"
  onClick={close}
  closeButtonLabel={translate('common.close')}
>
  <div class="flex h-full flex-1 flex-col">
    <div class="flex items-center justify-between px-6 py-2">
      <div
        class="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-slate-100"
      >
        <Icon name="filter" class="h-5 w-5" />
        Builder
      </div>
      {#if editingQuery}
        <button
          class="flex items-center gap-1.5 rounded border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-700"
          onclick={copyShareableLink}
        >
          Share
          {#if $copied}
            <Icon name="checkmark" />
          {:else}
            <Icon name="copy" />
          {/if}
        </button>
      {/if}
    </div>
    <div class="flex flex-col gap-1 border-y border-subtle p-2 text-xs">
      <FilterList onFilterClick={setFilter} />
    </div>
    <Filter />
    <SavedQuery {editingQuery} {close} />
  </div>
</Drawer>
