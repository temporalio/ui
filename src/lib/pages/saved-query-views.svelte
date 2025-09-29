<script lang="ts">
  import { slide } from 'svelte/transition';

  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import DeleteViewModal from '$lib/components/workflow/filter-bar/delete-view-modal.svelte';
  import EditViewModal from '$lib/components/workflow/filter-bar/edit-view-modal.svelte';
  import SaveViewModal from '$lib/components/workflow/filter-bar/save-view-modal.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import { savedQueryNavOpen } from '$lib/stores/nav-open';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    MAX_SAVED_WORKFLOW_QUERIES,
    type SavedQuery,
    savedWorkflowQueries,
  } from '$lib/stores/saved-queries';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
  };

  const getLastHour = () => {
    const lastHour = new Date();
    lastHour.setHours(lastHour.getHours() - 1);
    lastHour.setSeconds(0, 0);
    return lastHour.toISOString();
  };

  const systemViews: SavedQuery[] = [
    {
      id: 'all',
      name: 'All Workflows',
      query: '',
      icon: 'workflow',
      type: 'system',
    },
    // {
    //   id: 'task-failures',
    //   name: 'Task Failures',
    //   query: 'ExecutionStatus = "Failed" OR ExecutionStatus = "Terminated"',
    //   icon: 'error',
    //   count: 17,
    //   class: 'text-danger',
    //   type: 'system',
    // },
    {
      id: 'child-workflows',
      name: 'Parent Workflows',
      query: '`ParentWorkflowId` is null',
      icon: 'relationship',
      type: 'system',
    },
    {
      id: 'running',
      name: 'Running',
      query: '`ExecutionStatus`="Running"',
      icon: 'heartbeat',
      type: 'system',
    },
    {
      id: 'today',
      name: 'Today',
      query: `StartTime >= "${getToday()}"`,
      icon: 'calendar',
      type: 'system',
    },
    {
      id: 'last-hour',
      name: 'Last Hour',
      query: `StartTime >= "${getLastHour()}"`,
      icon: 'clock',
      type: 'system',
    },
  ];

  let activeQueryView: SavedQuery | undefined = $state();
  let saveViewModalOpen = $state(false);
  let editViewModalOpen = $state(false);
  let deleteViewModalOpen = $state(false);
  let pendingQueryTarget: string | undefined = $state();

  const query = $derived(page.url.searchParams.get('query') || '');
  const savedQueryParam = page.url.searchParams.get('savedQuery');
  const namespace = $derived(page.params.namespace);

  const maxViewsReached = $derived(
    $savedWorkflowQueries?.[namespace]?.length >= MAX_SAVED_WORKFLOW_QUERIES,
  );

  const namespaceSavedQueries = $derived(
    $savedWorkflowQueries?.[namespace]?.sort((a, b) =>
      a.name.localeCompare(b.name),
    ) || [],
  );
  const systemQueryView = $derived(
    (query && systemViews.find((q) => q.query === query)) ||
      (!query && systemViews.find((q) => q.id === 'all')),
  );
  const savedQueryView = $derived(
    query && namespaceSavedQueries.find((q) => q.query === query),
  );
  const unsaveView: SavedQuery = $derived({
    id: 'unsaved',
    name: 'New View',
    query,
    icon: 'bookmark',
    badge: 'Unsaved',
    type: 'system',
    active: true,
  });
  const unsavedQuery = $derived(query && activeQueryView?.id === 'unsaved');

  onMount(() => {
    if (savedQueryParam) {
      const queryToSave = {
        name: savedQueryParam,
        query,
        id: Date.now().toString(),
        type: 'user',
      };

      if (!$savedWorkflowQueries[namespace])
        $savedWorkflowQueries[namespace] = [];

      if (!maxViewsReached) {
        $savedWorkflowQueries[namespace] = [
          ...$savedWorkflowQueries[namespace],
          queryToSave,
        ];
      }

      activeQueryView = queryToSave;
      const url = new URL(page.url);
      url.searchParams.delete('savedQuery');
      goto(url);
    } else if (savedQueryView) {
      activeQueryView = savedQueryView;
    } else if (systemQueryView) {
      activeQueryView = systemQueryView;
    } else if (query) {
      activeQueryView = unsaveView;
    }
  });

  $effect(() => {
    if (pendingQueryTarget !== undefined) {
      if (query === pendingQueryTarget) pendingQueryTarget = undefined;
      return;
    }

    if (activeQueryView?.type === 'system') {
      if (query && activeQueryView.query !== query) {
        if (savedQueryView) {
          activeQueryView = savedQueryView;
        } else if (systemQueryView) {
          activeQueryView = systemQueryView;
        } else {
          activeQueryView = unsaveView;
        }
      }
    }
  });

  const setActiveQueryView = (view: SavedQuery) => {
    activeQueryView = view;
    pendingQueryTarget = view.query || '';

    if (unsavedQuery && view.id === 'unsaved') {
      saveViewModalOpen = true;
      return;
    }

    if (view.query) {
      $workflowFilters = toListWorkflowFilters(view.query, $searchAttributes);
    }

    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: view.query,
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
  };

  const { copy, copied } = copyToClipboard();

  const handleCopy = (e: Event) => {
    const sharableViewUrl =
      new URL(page.url.href) +
      '&savedQuery=' +
      encodeURIComponent(activeQueryView.name);
    copy(e, sharableViewUrl);
  };

  const onCreateView = (view: SavedQuery) => {
    if (!$savedWorkflowQueries[namespace]) {
      $savedWorkflowQueries[namespace] = [];
    }

    $savedWorkflowQueries[namespace] = [
      ...$savedWorkflowQueries[namespace],
      view,
    ];
    activeQueryView = view;
  };

  const onSaveView = (view: SavedQuery) => {
    if (!$savedWorkflowQueries[namespace]) {
      $savedWorkflowQueries[namespace] = [];
    }

    if (view.id === activeQueryView?.id) {
      $savedWorkflowQueries[namespace] = $savedWorkflowQueries[namespace].map(
        (q) => (q.id === view.id ? view : q),
      );
    } else {
      $savedWorkflowQueries[namespace] = [
        ...$savedWorkflowQueries[namespace],
        view,
      ];
    }
    activeQueryView = view;
  };

  const onDeleteView = () => {
    $savedWorkflowQueries[namespace] = $savedWorkflowQueries[namespace].filter(
      (q) => q?.id !== activeQueryView?.id,
    );
    $workflowFilters = [];
    activeQueryView = undefined;
    updateQueryParameters({
      url: page.url,
      parameter: 'query',
      value: '',
      allowEmpty: true,
      clearParameters: [currentPageKey],
    });
  };

  function portal(
    node: HTMLElement,
    target: HTMLElement | string = document.body,
  ) {
    const targetEl =
      typeof target === 'string'
        ? (document.querySelector(target) as HTMLElement | null)
        : (target as HTMLElement | null);
    if (targetEl) targetEl.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }

  let showTooltip = $state(false);
  let tooltipText: string | undefined = $state();
  let tooltipX = $state(0);
  let tooltipY = $state(0);

  const positionTooltipFrom = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    tooltipX = Math.round(rect.right + 8);
    tooltipY = Math.round(rect.top + 16);
  };

  const onQueryBtnEnter = (e: MouseEvent, name: string) => {
    if ($savedQueryNavOpen) return;
    const el = e.currentTarget as HTMLElement;
    tooltipText = name;
    positionTooltipFrom(el);
    showTooltip = true;
  };

  const onQueryBtnMove = (e: MouseEvent) => {
    if (!showTooltip) return;
    const el = e.currentTarget as HTMLElement;
    positionTooltipFrom(el);
  };

  const onQueryBtnLeave = () => {
    showTooltip = false;
  };
</script>

<div
  class={merge(
    'surface-primary relative h-[var(--panel-h)] h-auto max-h-[var(--panel-h)] min-h-[var(--panel-h)] w-[var(--panel-collapsed-w)] min-w-[var(--panel-collapsed-w)] max-w-[var(--panel-collapsed-w)] overflow-auto border border-r-0 border-subtle shadow-sm transition-all duration-300 ease-in-out',
    $savedQueryNavOpen
      ? 'lg:w-[var(--panel-expanded-w)] lg:min-w-[var(--panel-expanded-w)] lg:max-w-[var(--panel-expanded-w)]'
      : 'lg:w-[var(--panel-collapsed-w)] lg:min-w-[var(--panel-collapsed-w)] lg:max-w-[var(--panel-collapsed-w)]',
  )}
  style="will-change: width"
>
  <div
    class="flex items-center justify-center gap-2 border-b border-subtle px-2 py-[.35rem] text-center lg:justify-start lg:py-[.47rem]"
  >
    <div
      class={merge(
        'flex w-full items-center justify-between',
        $savedQueryNavOpen ? 'lg:justify-between' : 'lg:justify-center',
      )}
    >
      {#if $savedQueryNavOpen}
        <p
          class="hidden whitespace-nowrap text-xs font-medium leading-3 lg:block lg:text-sm"
          in:slide
        >
          Saved Views
          <span
            class={merge(
              'text-xs text-secondary',
              $savedQueryNavOpen ? 'lg:inline' : 'lg:hidden',
            )}
          >
            {namespaceSavedQueries.length} / 20
          </span>
        </p>
      {/if}
      <p class="block text-xs font-medium leading-3 lg:hidden">Saved Views</p>
      <button
        class="hidden rounded-sm p-0.5 hover:bg-secondary lg:inline-flex"
        aria-label={$savedQueryNavOpen
          ? 'Collapse saved views'
          : 'Expand saved views'}
        title={$savedQueryNavOpen ? 'Collapse' : 'Expand'}
        onclick={() => ($savedQueryNavOpen = !$savedQueryNavOpen)}
      >
        <Icon name={$savedQueryNavOpen ? 'chevron-left' : 'chevron-right'} />
      </button>
    </div>
  </div>

  <div class="space-y-2 p-1.5">
    <div class="border-b border-subtle pb-2 text-center">
      <div class="space-y-1">
        {#each systemViews as view}
          {@render queryButton({
            ...view,
            active: query === view.query,
          })}
        {/each}
      </div>
    </div>

    {#if unsavedQuery}
      {@render queryButton(unsaveView)}
    {/if}

    {#if namespaceSavedQueries.length > 0}
      <div class="text-center">
        <div class="space-y-1">
          {#each namespaceSavedQueries as savedQuery}
            {@render queryButton({
              ...savedQuery,
              active: savedQuery.id === activeQueryView?.id,
              badge:
                savedQuery.id === activeQueryView?.id &&
                savedQuery.query !== query
                  ? 'Unsaved'
                  : undefined,
            })}
          {/each}
        </div>
      </div>
    {/if}

    {#if namespaceSavedQueries.length === 0 && !unsavedQuery}
      <div class="space-y-1">
        {@render queryButton({
          id: 'no-views',
          name: 'No views',
          query,
          icon: 'bookmark',
          badge: 'Add Filter',
          type: 'system',
          active: false,
          disabled: true,
        })}
      </div>
    {/if}
  </div>
</div>
<SaveViewModal bind:open={saveViewModalOpen} {onCreateView} />
<EditViewModal
  view={activeQueryView}
  bind:open={editViewModalOpen}
  {onSaveView}
  {onCreateView}
/>
<DeleteViewModal
  view={activeQueryView}
  bind:open={deleteViewModalOpen}
  {onDeleteView}
/>

{#snippet queryButton(view: SavedQuery)}
  <div
    class="w-full"
    role="menuitem"
    tabindex="-1"
    onmouseenter={(e) => onQueryBtnEnter(e, view.name)}
    onmousemove={onQueryBtnMove}
    onmouseleave={onQueryBtnLeave}
  >
    <Button
      variant="ghost"
      data-testid={view.id}
      on:click={() => setActiveQueryView(view)}
      class={merge('flex w-full justify-start', view.class || '')}
      active={view?.active}
      disabled={view?.disabled}
      size="sm"
    >
      <Icon
        name={view?.icon || 'bookmark'}
        class={merge(
          'h-4 w-4 flex-shrink-0  transition-colors duration-200',
          $savedQueryNavOpen ? 'lg:hidden' : '',
        )}
      />

      {#if $savedQueryNavOpen}
        <span
          class="hidden truncate text-left text-sm font-normal lg:inline-block"
          in:slide>{view.name}</span
        >
        {#if view?.badge}
          <span
            class="surface-information right-2 top-2 hidden rounded-sm px-2 py-0.5 text-xs font-medium italic text-primary lg:static lg:ml-auto lg:block"
            in:slide>{view?.badge || ''}</span
          >
        {/if}
        {#if view?.count}
          <span
            class="surface-danger right-2 top-2 hidden rounded-sm px-2 py-0.5 text-xs font-medium italic text-primary lg:static lg:ml-auto lg:block"
            in:slide>{view?.count || ''}</span
          >
        {/if}
      {/if}
    </Button>

    {#if activeQueryView?.id === view?.id && view.type === 'user'}
      <div
        class={merge(
          'flex flex-col items-center gap-1 overflow-hidden transition-all ',
          $savedQueryNavOpen && 'lg:flex-row',
        )}
        in:slide
      >
        <Button
          size="xs"
          class="w-full scale-90"
          variant="secondary"
          on:click={() => {
            editViewModalOpen = true;
          }}>Save</Button
        >
        <Button
          leadingIcon={$copied ? 'checkmark' : 'copy'}
          size="xs"
          class="w-full scale-90"
          variant="ghost"
          on:click={handleCopy}
          ><span class={merge('hidden', $savedQueryNavOpen && 'lg:inline')}
            >Share</span
          ></Button
        >
        <Button
          variant="destructive"
          size="xs"
          class="w-full scale-90"
          on:click={() => (deleteViewModalOpen = true)}
          ><span class={merge('inline', $savedQueryNavOpen && 'lg:hidden')}
            ><Icon name="trash" /></span
          ><span class={merge('hidden', $savedQueryNavOpen && 'lg:inline')}
            >Discard</span
          ></Button
        >
      </div>
    {:else if unsavedQuery && view?.id === 'unsaved'}
      <div
        class="flex items-center gap-1 overflow-hidden pt-0.5"
        transition:slide
      >
        <Button
          size="xs"
          class="w-full transition-all"
          variant="secondary"
          disabled={maxViewsReached}
          on:click={() => {
            saveViewModalOpen = true;
          }}>Save</Button
        >
      </div>
    {/if}
  </div>
{/snippet}

{#if showTooltip && tooltipText}
  <div
    use:portal
    class="pointer-events-none z-[9999] inline-block select-none rounded-md bg-slate-800 p-2 text-xs text-slate-50 opacity-95"
    style={`position: fixed; top: ${tooltipY}px; left: ${tooltipX}px; transform: translateY(-50%); max-width: 280px;`}
    role="tooltip"
  >
    {tooltipText}
  </div>
{/if}
