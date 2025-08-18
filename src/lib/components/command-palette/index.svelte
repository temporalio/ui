<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Loading from '$lib/holocene/loading.svelte';
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
    // routeForWorkflowStart,
  } from '$lib/utilities/route-for';

  import StartWorkflowForm from './actions/start-workflow/form.svelte';
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

  const namespace = $derived($page.params?.namespace || 'default');
  const commands = $derived(getCommands(namespace));
  const filteredCommands = $derived(filterCommands(commands, searchQuery));

  function getCommands(namespace: string): CommandItem[] {
    return [
      {
        id: 'start-workflow',
        title: 'Start Workflow',
        subtitle: 'Create a new workflow execution',
        icon: 'play',
        category: 'Actions',
        action: () => {
          ActiveComponent = StartWorkflowForm;
          // goto(routeForWorkflowStart({ namespace }));

          // close();
        },
      },
      {
        id: 'create-schedule',
        title: 'Create Schedule',
        subtitle: 'Create a new workflow schedule',
        icon: 'add',
        category: 'Action',
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
</script>

{#snippet commandList()}
  {#each filteredCommands as command, index (command.id)}
    <button
      type="button"
      class="flex w-full items-center justify-between rounded-sm border border-transparent px-4 py-3 text-left transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800"
      class:selected={index === selectedIndex}
      onclick={() => handleCommandClick(command)}
      onmouseenter={() => (selectedIndex = index)}
      role="option"
      aria-selected={index === selectedIndex}
    >
      <div class="flex items-center gap-3">
        {#if command.icon}
          <div class="h-5 w-5 flex-shrink-0 text-slate-500 dark:text-slate-400">
            <Icon name={command.icon} />
          </div>
        {/if}
        <div class="flex flex-col">
          <div class="font-medium text-slate-900 dark:text-slate-100">
            {command.title}
          </div>
          {#if command.subtitle}
            <div class="text-sm text-slate-500 dark:text-slate-400">
              {command.subtitle}
            </div>
          {/if}
        </div>
      </div>
      {#if command.category}
        <div
          class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
        >
          {command.category}
        </div>
      {/if}
    </button>
  {:else}
    <div
      class="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400"
    >
      <Icon name="search" />
      <p class="mt-2">No commands found</p>
      <p class="mt-2 text-sm text-slate-500">Try a different search term</p>
    </div>
  {/each}
{/snippet}

<Modal
  {open}
  on:close={close}
  class="max-w-2xl [&_.modal-content]:p-0"
  large
  id="command-palette"
  cancelText="Close"
  confirmText="Select"
  hideConfirm={true}
>
  <svelte:fragment slot="title">
    <div class="flex items-center gap-2 text-lg font-medium">
      <Loading title="" size={48} />
      Command Palette
    </div>
  </svelte:fragment>

  <div class="flex h-full flex-1 flex-col px-4" slot="content">
    {#if !ActiveComponent}
      <div class="border-b border-slate-200 pb-4 dark:border-slate-700">
        <Input
          id="action-search"
          bind:value={searchQuery}
          placeholder="Search for commands..."
          class="border-none shadow-none [&_input]:border-none [&_input]:px-4 [&_input]:py-3 [&_input]:text-lg [&_input]:shadow-none [&_input]:ring-0 [&_input]:focus:border-none [&_input]:focus:ring-0"
          icon="search"
          labelHidden
          label="Search commands"
          autocomplete="off"
          spellcheck={false}
        />
      </div>
    {/if}

    <div class="max-h-96 flex-1 overflow-y-auto" role="listbox">
      {#if ActiveComponent}
        <ActiveComponent />
      {:else}
        {@render commandList()}
      {/if}
    </div>

    <div class="border-t border-slate-200 pt-3 dark:border-slate-700">
      <div class="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span class="flex items-center gap-1">
          <kbd
            class="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
            >↑</kbd
          ><kbd
            class="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
            >↓</kbd
          > to navigate
        </span>
        <span class="flex items-center gap-1">
          <kbd
            class="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
            >⏎</kbd
          > to select
        </span>
        <span class="flex items-center gap-1">
          <kbd
            class="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-700"
            >Esc</kbd
          > to close
        </span>
      </div>
    </div>
  </div>
</Modal>

<style lang="postcss">
  .selected {
    @apply border-blue-200 bg-blue-50;
  }

  :global(.body::backdrop) {
    background: linear-gradient(-45deg, #64748b, #6366f1, #475569, #4f46e5);
    background-size: 100% 100%;
    animation: gradientShift 4s ease-in-out infinite;
    opacity: 0.25;
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }
</style>
