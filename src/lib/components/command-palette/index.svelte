<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
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

  import Modal from './modal.svelte';

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let searchQuery = $state('');
  let selectedIndex = $state(0);
  let ActiveComponent = $state();

  interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    icon?: IconName;
    action: () => void;
    category?: string;
  }

  const namespace = $derived(page.params?.namespace || 'default');
  const commands = $derived(getCommands(namespace));
  const filteredCommands = $derived(filterCommands(commands, searchQuery));

  function getCommands(namespace: string): CommandItem[] {
    return [
      {
        id: 'start-workflow',
        title: 'Start Workflow',
        subtitle: 'Create a new workflow execution',
        icon: 'play',
        category: 'Navigation',
        action: () => {
          goto(routeForWorkflowStart({ namespace }));
          close();
        },
      },
      {
        id: 'create-schedule',
        title: 'Create Schedule',
        subtitle: 'Create a new workflow schedule',
        icon: 'add',
        category: 'Navigation',
        action: () => {
          goto(routeForScheduleCreate({ namespace }));
          close();
        },
      },
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
      case 'ArrowLeft':
        if (ActiveComponent) {
          event.preventDefault();
          onBack();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(
          selectedIndex + 1,
          filteredCommands.length - 1,
        );
        scrollToSelected();
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        scrollToSelected();
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

  function scrollToSelected() {
    // Use requestAnimationFrame to ensure DOM is updated with new selectedIndex
    requestAnimationFrame(() => {
      const selectedButton = document.querySelector(
        '[role="listbox"] button[aria-selected="true"]',
      );
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    });
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
    const modal = document.getElementById('command-palette');
    if (modal) {
      modal.classList.add('closing');
      setTimeout(() => {
        open = false;
        searchQuery = '';
        selectedIndex = 0;
        modal.classList.remove('closing');
      }, 150);
    } else {
      open = false;
      searchQuery = '';
      selectedIndex = 0;
    }
  }

  function toggle() {
    if (open) {
      close();
    } else {
      open = true;
      searchQuery = '';
      selectedIndex = 0;
      ActiveComponent = undefined;
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

  function onBack() {
    ActiveComponent = undefined;
  }
</script>

{#snippet keyboardShortcuts()}
  <div class="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
    <span class="flex items-center gap-1.5">
      {#if ActiveComponent}
        <kbd
          class="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-700"
          >←</kbd
        >
      {/if}
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

{#snippet commandList()}
  {#each filteredCommands as command, index (command.id)}
    <button
      type="button"
      class="flex w-full items-center justify-between rounded-lg border border-transparent px-6 py-4 text-left transition-all duration-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800"
      class:selected={index === selectedIndex}
      onclick={() => handleCommandClick(command)}
      onmouseenter={() => (selectedIndex = index)}
      role="option"
      aria-selected={index === selectedIndex}
    >
      <div class="flex items-center gap-4">
        {#if command.icon}
          <div class="h-6 w-6 flex-shrink-0 text-secondary">
            <Icon name={command.icon} />
          </div>
        {/if}
        <div class="flex flex-col gap-1">
          <div class="text-lg font-semibold text-secondary">
            {command.title}
          </div>
          {#if command.subtitle}
            <div class="text-sm text-secondary">
              {command.subtitle}
            </div>
          {/if}
        </div>
      </div>
      {#if command.category}
        <div
          class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
        >
          {command.category}
        </div>
      {/if}
    </button>
  {:else}
    <div
      class="flex min-h-96 flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400"
    >
      <Icon name="search" />
      <h3 class="mt-2 text-secondary">No commands found</h3>
      <p class="mt-2 text-secondary">Try a different search term</p>
    </div>
  {/each}
{/snippet}

<Modal
  {open}
  onclose={close}
  class="command-palette-modal h-[70vh] max-h-[600px] w-[90vw] max-w-4xl [&_.modal-content]:p-0"
  id="command-palette"
  cancelText="Close"
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
            <div class="h-5 w-5 text-indigo-600 dark:text-indigo-400">
              <Icon name="search" />
            </div>
            Command Palette
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
        {#if !ActiveComponent}
          <div class="px-6">
            <Input
              id="action-search"
              bind:value={searchQuery}
              placeholder="Search for commands..."
              icon="search"
              labelHidden
              label="Search commands"
              autocomplete="off"
              spellcheck={false}
            />
          </div>
        {/if}
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-6 py-4" role="listbox">
        {#if ActiveComponent}
          <ActiveComponent {onBack} />
        {:else}
          {@render commandList()}
        {/if}
      </div>
    </div>
  {/snippet}
</Modal>

<style lang="postcss">
  .selected {
    @apply border-indigo-200 bg-indigo-50 shadow-sm;
  }

  :global(.body::backdrop) {
    background: rgb(15 23 42 / 75%);
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.body[open]::backdrop) {
    opacity: 1;
  }
</style>
