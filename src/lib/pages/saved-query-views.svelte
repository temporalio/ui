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
  import { currentPageKey } from '$lib/stores/pagination';
  import { savedQueries, type SavedQuery } from '$lib/stores/saved-queries';
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

  const clearAllSavedViews = () => {
    $savedQueries[namespace] = [];
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
    //   count: 8,
    //   class: 'text-danger',
    // },
    {
      id: 'child-workflows',
      name: 'Parent Workflows',
      query: 'ParentWorkflowId is null',
      icon: 'relationship',
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

  let namespaceSavedQueries = $derived(
    $savedQueries?.[namespace]?.sort((a, b) => a.name.localeCompare(b.name)) ||
      [],
  );
  const systemQueryView = $derived(
    query && systemViews.find((q) => q.query === query),
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

      if (!$savedQueries[namespace]) $savedQueries[namespace] = [];

      $savedQueries[namespace] = [...$savedQueries[namespace], queryToSave];
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
    if (!$savedQueries[namespace]) {
      $savedQueries[namespace] = [];
    }

    $savedQueries[namespace] = [...$savedQueries[namespace], view];
    activeQueryView = view;
  };

  const onSaveView = (view: SavedQuery) => {
    if (!$savedQueries[namespace]) {
      $savedQueries[namespace] = [];
    }

    if (view.id === activeQueryView?.id) {
      $savedQueries[namespace] = $savedQueries[namespace].map((q) =>
        q.id === view.id ? view : q,
      );
    } else {
      $savedQueries[namespace] = [...$savedQueries[namespace], view];
    }
    activeQueryView = view;
  };

  const onDeleteView = () => {
    $savedQueries[namespace] = $savedQueries[namespace].filter(
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
</script>

<div
  class="surface-primary max-h-[82vh] w-[60px] min-w-[60px] max-w-[60px] overflow-auto rounded-l-sm border border-r-0 border-subtle shadow-sm lg:w-[240px] lg:min-w-[240px] lg:max-w-[240px]"
>
  <div
    class="flex items-center justify-center gap-2 border-b border-subtle px-2 py-[.35rem] text-center lg:justify-start lg:py-[.47rem]"
  >
    <div class="flex w-full justify-between">
      <p class="text-xs font-medium leading-3 lg:block lg:text-sm">
        Saved Views
      </p>
      <button
        class="hidden rounded-sm p-0.5 text-xs leading-3 hover:bg-secondary lg:inline-block"
        onclick={clearAllSavedViews}>Clear All</button
      >
    </div>
  </div>

  <div class="space-y-2 p-2">
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

    {#if unsavedQuery}
      <div class="space-y-1">
        {@render queryButton(unsaveView)}
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
  <Button
    variant="ghost"
    data-testid={view.id}
    on:click={() => setActiveQueryView(view)}
    class={merge('w-full', view.class || '')}
    active={view?.active}
    disabled={view?.disabled}
    size="sm"
  >
    <Icon
      name={view?.icon || 'bookmark'}
      class={merge(
        'h-4 w-4 flex-shrink-0 transition-colors duration-200 lg:hidden',
      )}
    />
    <span class="hidden truncate text-left text-sm font-normal lg:inline-block"
      >{view.name}</span
    >
    <span
      class:invisible={!view?.badge}
      class="surface-information right-2 top-2 hidden rounded-sm px-2 py-0.5 text-xs font-medium italic text-primary lg:static lg:ml-auto lg:block"
      >{view?.badge || ''}</span
    >
    {#if view.count !== undefined}
      <span
        class="surface-danger hidden rounded-full px-2 py-0.5 font-mono text-xs font-medium lg:inline-block"
        >{view.count}</span
      >
    {/if}
  </Button>
  {#if activeQueryView?.id === view?.id && view.type === 'user'}
    <div class="flex items-center gap-1" transition:slide>
      <Button
        size="xs"
        class="w-full"
        variant="secondary"
        on:click={() => {
          if (view.id === 'unsaved') {
            saveViewModalOpen = true;
          } else {
            editViewModalOpen = true;
          }
        }}>Save</Button
      >
      <Button
        leadingIcon={$copied ? 'checkmark' : 'copy'}
        size="xs"
        class="w-full"
        variant="ghost"
        on:click={handleCopy}>Share</Button
      >
      <Button
        variant="destructive"
        size="xs"
        class="w-full"
        on:click={() => (deleteViewModalOpen = true)}>Discard</Button
      >
    </div>
  {:else if unsavedQuery && view?.id === 'unsaved'}
    <div class="flex items-center gap-1" transition:slide>
      <Button size="xs" class="w-full" variant="secondary">Save</Button>
    </div>
  {/if}
{/snippet}
