<script lang="ts">
  import { page } from '$app/state';

  import WorkflowSearchAttributeFilter from '$lib/components/workflow/search-attribute-filter/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  import Modal from '../command-palette/modal.svelte';

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let query = $derived(page.url.searchParams.get('query'));

  let searchQuery = $state('');

  function handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      toggle();
    }
  }

  function close() {
    const modal = document.getElementById('command-palette');
    if (modal) {
      modal.classList.add('closing');
      setTimeout(() => {
        open = false;
        searchQuery = '';
        modal.classList.remove('closing');
      }, 150);
    } else {
      open = false;
      searchQuery = '';
    }
  }

  function toggle() {
    if (open) {
      close();
    } else {
      open = true;
      searchQuery = '';
    }
  }

  // Reset selected index when search changes
  $effect(() => {
    if (searchQuery) {
      // selectedIndex = 0;
    }
  });

  $effect(() => {
    document.addEventListener('keydown', handleGlobalKeydown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeydown);
    };
  });
</script>

{#snippet keyboardShortcuts()}
  <div class="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
    <span class="flex items-center gap-1.5">
      <kbd
        class="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-700"
        >↑</kbd
      ><kbd
        class="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-700"
        >↓</kbd
      >
      <span class="text-slate-400">navigate</span>
    </span>
    <span class="flex items-center gap-1.5">
      <kbd
        class="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-700"
        >⏎</kbd
      >
      <span class="text-slate-400">select</span>
    </span>
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
  {open}
  on:close={close}
  class="command-palette-modal h-[70vh] max-h-[600px] w-[90vw] max-w-4xl [&_.modal-content]:p-0"
  id="command-palette"
  cancelText="Close"
  confirmText="Select"
  hideConfirm={true}
  loading={true}
>
  <div class="flex h-full flex-1 flex-col" slot="content">
    <div
      class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 pb-4 pt-2 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95"
    >
      <div class="flex items-center justify-between px-6 py-3">
        <div
          class="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          <div class="h-5 w-5 text-indigo-600 dark:text-indigo-400">
            <Icon name="search" />
          </div>
          Query Palette
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
      <div class="px-6">
        <Input
          id="action-search"
          bind:value={query}
          placeholder="Query string"
          icon="search"
          labelHidden
          label="Search commands"
          disabled
          autocomplete="off"
          spellcheck={false}
        />
      </div>
    </div>

    <!-- Scrollable Content -->
    <div class="min-h-96 flex-1 overflow-y-auto px-6 py-4" role="listbox">
      <WorkflowSearchAttributeFilter />
    </div>
  </div>
</Modal>

<style lang="postcss">
  .selected {
    @apply border-indigo-200 bg-indigo-50 shadow-sm;
  }

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
