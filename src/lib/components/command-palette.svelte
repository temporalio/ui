<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import {
    routeForArchivalWorkfows,
    routeForBatchOperations,
    routeForEventHistoryImport,
    routeForNamespaces,
    routeForNexus,
    routeForScheduleCreate,
    routeForSchedules,
    routeForWorkerDeployments,
    routeForWorkflows,
    routeForWorkflowStart,
  } from '$lib/utilities/route-for';

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let searchQuery = $state('');
  let selectedIndex = $state(0);

  interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon?: string;
    action: () => void;
    category?: string;
  }

  const namespace = $derived($page.params?.namespace || 'default');
  const commands = $derived(getCommands(namespace));
  const filteredCommands = $derived(filterCommands(commands, searchQuery));

  $inspect('filteredCommands: ', filteredCommands);
  function getCommands(namespace: string): CommandItem[] {
    return [
      // Navigation Commands
      {
        id: 'workflows',
        title: 'View Workflows',
        subtitle: `Navigate to workflows in ${namespace}`,
        icon: 'workflow',
        category: 'Navigation',
        action: () => {
          goto(routeForWorkflows({ namespace }));
          close();
        },
      },
      {
        id: 'start-workflow',
        title: 'Start Workflow',
        subtitle: 'Create a new workflow execution',
        icon: 'play',
        category: 'Actions',
        action: () => {
          goto(routeForWorkflowStart({ namespace }));
          close();
        },
      },
      {
        id: 'schedules',
        title: 'View Schedules',
        subtitle: `Navigate to schedules in ${namespace}`,
        icon: 'schedules',
        category: 'Navigation',
        action: () => {
          goto(routeForSchedules({ namespace }));
          close();
        },
      },
      {
        id: 'create-schedule',
        title: 'Create Schedule',
        subtitle: 'Create a new workflow schedule',
        icon: 'plus',
        category: 'Actions',
        action: () => {
          goto(routeForScheduleCreate({ namespace }));
          close();
        },
      },
      {
        id: 'batch-operations',
        title: 'View Batch Operations',
        subtitle: `Navigate to batch operations in ${namespace}`,
        icon: 'batch-operation',
        category: 'Navigation',
        action: () => {
          goto(routeForBatchOperations({ namespace }));
          close();
        },
      },
      {
        id: 'worker-deployments',
        title: 'View Worker Deployments',
        subtitle: `Navigate to worker deployments in ${namespace}`,
        icon: 'merge',
        category: 'Navigation',
        action: () => {
          goto(routeForWorkerDeployments({ namespace }));
          close();
        },
      },
      {
        id: 'archival',
        title: 'View Archive',
        subtitle: `Navigate to archived workflows in ${namespace}`,
        icon: 'archives',
        category: 'Navigation',
        action: () => {
          goto(routeForArchivalWorkfows({ namespace }));
          close();
        },
      },
      {
        id: 'namespaces',
        title: 'View Namespaces',
        subtitle: 'Navigate to namespace overview',
        icon: 'namespace',
        category: 'Navigation',
        action: () => {
          goto(routeForNamespaces());
          close();
        },
      },
      {
        id: 'nexus',
        title: 'View Nexus',
        subtitle: 'Navigate to Nexus endpoints',
        icon: 'nexus',
        category: 'Navigation',
        action: () => {
          goto(routeForNexus());
          close();
        },
      },
      {
        id: 'import',
        title: 'Import Events',
        subtitle: 'Import workflow event history',
        icon: 'import',
        category: 'Actions',
        action: () => {
          goto(routeForEventHistoryImport());
          close();
        },
      },
    ];
  }

  function filterCommands(
    commands: CommandItem[],
    query: string,
  ): CommandItem[] {
    if (!query.trim()) return commands;

    const lowercaseQuery = query.toLowerCase();
    return commands.filter((command) => {
      return (
        command.title.toLowerCase().includes(lowercaseQuery) ||
        command.subtitle?.toLowerCase().includes(lowercaseQuery) ||
        command.category?.toLowerCase().includes(lowercaseQuery)
      );
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!open) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(
          selectedIndex + 1,
          filteredCommands.length - 1,
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
    }
  }

  function handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      toggle();
    }
  }

  function handleCommandClick(command: CommandItem) {
    command.action();
  }

  function close() {
    open = false;
    searchQuery = '';
    selectedIndex = 0;
  }

  function toggle() {
    open = !open;
    if (open) {
      searchQuery = '';
      selectedIndex = 0;
    }
  }

  // Reset selected index when search changes
  $effect(() => {
    if (searchQuery) {
      selectedIndex = 0;
    }
  });

  $effect(() => {
    document.addEventListener('keydown', handleGlobalKeydown);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeydown);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<Modal
  {open}
  on:close={close}
  class="command-palette-modal"
  large
  id="command-palette"
  cancelText="Close"
  confirmText="Select"
  hideConfirm={true}
>
  <svelte:fragment slot="title">
    <div class="flex items-center gap-2 text-lg font-medium">
      <Icon name="search" />
      Command Palette
    </div>
  </svelte:fragment>

  <div class="command-palette-container" slot="content">
    <div class="search-container">
      <Input
        bind:value={searchQuery}
        placeholder="Search for commands..."
        class="command-search-input"
        icon="search"
        labelHidden
        label="Search commands"
        autocomplete="off"
        spellcheck={false}
      />
    </div>

    <div class="commands-list" role="listbox">
      {#each filteredCommands as command, index (command.id)}
        <button
          type="button"
          class="command-item"
          class:selected={index === selectedIndex}
          onclick={() => handleCommandClick(command)}
          onmouseenter={() => (selectedIndex = index)}
          role="option"
          aria-selected={index === selectedIndex}
        >
          <div class="command-content">
            {#if command.icon}
              <div class="command-icon">
                <Icon name={command.icon} />
              </div>
            {/if}
            <div class="command-text">
              <div class="command-title">{command.title}</div>
              {#if command.subtitle}
                <div class="command-subtitle">{command.subtitle}</div>
              {/if}
            </div>
          </div>
          {#if command.category}
            <div class="command-category">{command.category}</div>
          {/if}
        </button>
      {:else}
        <div class="no-results">
          <Icon name="search" />
          <p>No commands found</p>
          <p class="text-sm text-slate-500">Try a different search term</p>
        </div>
      {/each}
    </div>

    <div class="command-palette-footer">
      <div class="keyboard-hints">
        <span class="hint">
          <kbd>↑</kbd><kbd>↓</kbd> to navigate
        </span>
        <span class="hint">
          <kbd>⏎</kbd> to select
        </span>
        <span class="hint">
          <kbd>Esc</kbd> to close
        </span>
      </div>
    </div>
  </div>
</Modal>

<style lang="postcss">
  .command-palette-container {
    @apply flex h-full flex-1 flex-col gap-4;
  }

  .search-container {
    @apply border-b border-slate-200 pb-4 dark:border-slate-700;
  }

  :global(.command-search-input) {
    @apply border-none shadow-none;
  }

  :global(.command-search-input input) {
    @apply border-none px-4 py-3 text-lg shadow-none ring-0 focus:border-none focus:ring-0;
  }

  .commands-list {
    @apply max-h-96 flex-1 overflow-y-auto;
  }

  .command-item {
    @apply flex w-full items-center justify-between rounded-lg border border-transparent px-4 py-3 text-left transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800;
  }

  .command-item.selected {
    @apply border border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30;
  }

  .command-content {
    @apply flex items-center gap-3;
  }

  .command-icon {
    @apply h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400;
  }

  .command-text {
    @apply flex flex-col;
  }

  .command-title {
    @apply font-medium text-slate-900 dark:text-slate-100;
  }

  .command-subtitle {
    @apply text-sm text-slate-500 dark:text-slate-400;
  }

  .command-category {
    @apply rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300;
  }

  .no-results {
    @apply flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400;
  }

  .no-results p {
    @apply mt-2;
  }

  .command-palette-footer {
    @apply border-t border-slate-200 pt-3 dark:border-slate-700;
  }

  .keyboard-hints {
    @apply flex gap-4 text-sm text-slate-500 dark:text-slate-400;
  }

  .hint {
    @apply flex items-center gap-1;
  }

  kbd {
    @apply rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700;
  }

  :global(.command-palette-modal) {
    @apply max-w-2xl;
  }

  :global(.command-palette-modal .modal-content) {
    @apply p-0;
  }
</style>
