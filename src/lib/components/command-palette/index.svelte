<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity';

  import type { Snippet } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    routeForArchivalWorkflows,
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
  let ActiveComponent: Snippet | undefined = $state();
  const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

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
          goto(routeForArchivalWorkflows({ namespace }));
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
          behavior: reducedMotion.current ? 'auto' : 'smooth',
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
  <div class="hidden gap-3 text-xs text-secondary md:flex">
    <span class="flex items-center gap-1.5">
      {#if ActiveComponent}
        <kbd
          class="surface-secondary rounded-control border border-subtle px-1.5 py-0.5 font-mono text-[0.6875rem]"
          >←</kbd
        >
      {/if}
      <kbd
        class="surface-secondary rounded-control border border-subtle px-1.5 py-0.5 font-mono text-[0.6875rem]"
        >↑</kbd
      ><kbd
        class="surface-secondary rounded-control border border-subtle px-1.5 py-0.5 font-mono text-[0.6875rem]"
        >↓</kbd
      >
      <span class="text-subtle">navigate</span>
    </span>
    <span class="flex items-center gap-1.5">
      <kbd
        class="surface-secondary rounded-control border border-subtle px-1.5 py-0.5 font-mono text-[0.6875rem]"
        >⏎</kbd
      >
      <span class="text-subtle">select</span>
    </span>
    <span class="flex items-center gap-1.5">
      <kbd
        class="surface-secondary rounded-control border border-subtle px-1.5 py-0.5 font-mono text-[0.6875rem]"
        >Esc</kbd
      >
      <span class="text-subtle">close</span>
    </span>
  </div>
{/snippet}

{#snippet commandList()}
  {#each filteredCommands as command, index (command.id)}
    <button
      type="button"
      class="relative flex min-h-12 w-full items-center justify-between overflow-hidden rounded-control border border-transparent px-3 py-2 text-left transition-colors duration-fast hover:bg-interactive-secondary-hover"
      class:selected={index === selectedIndex}
      onclick={() => handleCommandClick(command)}
      onmouseenter={() => (selectedIndex = index)}
      role="option"
      aria-selected={index === selectedIndex}
    >
      <div class="flex min-w-0 items-center gap-2.5">
        {#if command.icon}
          <div class="h-6 w-6 flex-shrink-0 text-secondary">
            <Icon name={command.icon} />
          </div>
        {/if}
        <div class="flex min-w-0 flex-col">
          <div class="truncate text-sm font-medium text-primary">
            {command.title}
          </div>
          {#if command.subtitle}
            <div class="truncate text-xs text-secondary">
              {command.subtitle}
            </div>
          {/if}
        </div>
      </div>
      {#if command.category}
        <div
          class="surface-secondary ml-2 shrink-0 rounded-control border border-subtle px-1.5 py-0.5 text-[0.6875rem] font-medium text-secondary"
        >
          {command.category}
        </div>
      {/if}
    </button>
  {:else}
    <div
      class="flex min-h-48 flex-col items-center justify-center py-8 text-secondary"
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
  class="command-palette-modal h-[min(70dvh,36rem)] w-[calc(100vw-2rem)] max-w-3xl [&_.modal-content]:p-0"
  id="command-palette"
  cancelText="Close"
  loading={true}
>
  {#snippet content()}
    <div class="flex h-full flex-1 flex-col">
      <div
        class="surface-primary sticky top-0 z-sticky border-b border-subtle pb-3 pt-2"
      >
        <div class="flex items-center justify-between px-4 py-2">
          <div
            class="flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <div class="h-4 w-4 text-brand">
              <Icon name="search" />
            </div>
            Command Palette
          </div>
          <div class="flex items-center gap-2">
            {@render keyboardShortcuts()}
            <IconButton
              icon="close"
              label="Close"
              size="xs"
              onclick={close}
              class="text-secondary hover:text-primary"
            />
          </div>
        </div>
        {#if !ActiveComponent}
          <div class="px-4">
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
      <div class="flex-1 overflow-y-auto p-2" role="listbox">
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
    @apply border-subtle bg-interactive-secondary-active before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:bg-interactive;
  }

  :global(.command-palette-modal::backdrop) {
    background: rgb(12 15 20 / 64%);
    opacity: 0;
    transition: opacity var(--duration-normal) var(--ease-standard);
  }

  :global(.command-palette-modal[open]::backdrop) {
    opacity: 1;
  }
</style>
