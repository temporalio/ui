<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { searchInputViewOpen } from '$lib/stores/filters';
  import { type SavedQuery as SQ } from '$lib/stores/saved-queries';
  import { refresh } from '$lib/stores/workflows';

  import Modal from '../command-palette/modal.svelte';

  import SavedQuery from './saved-query/index.svelte';
  import FilterList from './search-attribute-filter/filter-list.svelte';
  import SearchAttributeFilter from './search-attribute-filter/filter.svelte';

  interface Props {
    open?: boolean;
    editingQuery: SQ | undefined;
  }

  let { open = $bindable(false), editingQuery = $bindable(undefined) }: Props =
    $props();

  function close() {
    const modal = document.getElementById('command-palette');
    if (modal) {
      modal.classList.add('closing');
      setTimeout(() => {
        open = false;
        modal.classList.remove('closing');
      }, 150);
    } else {
      open = false;
    }
  }

  $effect(() => {
    if (!open && editingQuery) {
      editingQuery = undefined;
    }
  });
</script>

{#snippet keyboardShortcuts()}
  <div class="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
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
  class="command-palette-modal h-[60vh] w-[90vw] max-w-4xl [&_.modal-content]:p-0"
  id="command-palette"
  loading={true}
>
  {#snippet content()}
    <div class="flex h-full flex-1 flex-col">
      <div
        class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 pb-4 pt-2 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95"
      >
        <div class="flex items-center justify-between px-6 py-3">
          <div
            class="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            Query Command Center
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
        <div class="flex flex-col gap-2 px-6">
          <SavedQuery {editingQuery} />
          <FilterList bind:filters={$workflowFilters} />
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="max-h-96 flex-1 overflow-y-auto" role="listbox">
        <SearchAttributeFilter
          showFilter={!$searchInputViewOpen}
          bind:filters={$workflowFilters}
          refresh={() => {
            $refresh = Date.now();
          }}
        />
      </div>
    </div>
  {/snippet}
</Modal>

<style lang="postcss">
  :global(.body::backdrop) {
    background: rgb(15 23 42 / 0%);
    backdrop-filter: blur(0.5px);
    opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.body[open]::backdrop) {
    opacity: 1;
  }
</style>
