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
  import Icon from '$lib/holocene/icon/icon.svelte';
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

  import Modal from '../command-palette/modal.svelte';

  import SavedQuery from './saved-query/index.svelte';
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

{#snippet keyboardShortcuts()}
  <div class="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
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
    <span class="flex items-center gap-1.5">
      <kbd
        class="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-700"
        >Esc</kbd
      >
      <span class="text-slate-400">close</span>
    </span>
  </div>
{/snippet}

<Modal
  bind:open
  onclose={close}
  class="command-palette-modal h-[80vh] w-[90vw] max-w-4xl lg:h-[60vh] [&_.modal-content]:p-0"
  id="command-palette"
  loading={true}
>
  {#snippet content()}
    <div class="flex h-full flex-1 flex-col">
      <div
        class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 pt-2 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95"
      >
        <div class="flex items-center justify-between px-6 py-3">
          <div
            class="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-slate-100"
          >
            <Icon name="filter" class="h-5 w-5" />
            Builder
          </div>
          <div class="flex items-center gap-4">
            {@render keyboardShortcuts()}
            <button
              type="button"
              onclick={close}
              class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Close"
            >
              <Icon name="close" class="h-4 w-4" />
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-1 border-t border-subtle p-2 text-xs">
          <FilterList onFilterClick={setFilter} />
        </div>
      </div>
      <div class="max-h-96 min-h-96 overflow-y-auto" role="listbox">
        <Filter />
      </div>
      <div class="flex flex-col gap-2 border-t border-subtle px-4 pt-6">
        <SavedQuery {editingQuery} {close} />
      </div>
    </div>
  {/snippet}
</Modal>

<style lang="postcss">
  :global(.body::backdrop) {
    background:
      radial-gradient(
        circle at 30% 50%,
        rgb(255 255 255 / 8%) 0%,
        transparent 60%
      ),
      radial-gradient(
        circle at 70% 80%,
        rgb(59 130 246 / 6%) 0%,
        transparent 60%
      ),
      linear-gradient(135deg, rgb(15 23 42 / 20%) 0%, rgb(68 76 231 / 20%) 50%);
    backdrop-filter: blur(0.5px) saturate(120%) brightness(80%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 10%);
  }
</style>
