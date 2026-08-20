<script lang="ts">
  import type { Readable, Writable } from 'svelte/store';
  import { slide } from 'svelte/transition';

  import { onMount, type Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    MAX_SAVED_QUERIES,
    type SavedQuery,
  } from '$lib/stores/saved-queries';
  import type { SearchAttributes } from '$lib/types/workflows';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { sortAlphabetically } from '$lib/utilities/sort-alphabetically';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import ViewModal from './view-modal.svelte';

  interface Props {
    filters: Writable<SearchAttributeFilter[]>;
    savedQueries: Writable<Record<string, SavedQuery[]>>;
    systemViews: SavedQuery[];
    defaultView: SavedQuery;
    maxQueries?: number;
    searchAttributes: Readable<SearchAttributes>;
    id: string;
    children: Snippet;
  }

  let {
    filters,
    savedQueries,
    systemViews,
    defaultView,
    maxQueries = MAX_SAVED_QUERIES,
    searchAttributes,
    id,
    children,
  }: Props = $props();

  let activeQueryView: SavedQuery | undefined = $state();
  let saveViewModalOpen = $state(false);
  let editViewModalOpen = $state(false);
  let pendingQueryTarget: string | undefined = $state();

  const query = $derived(page.url.searchParams.get('query') || '');
  const savedQueryParam = page.url.searchParams.get('savedQuery');
  const namespace = $derived(page.params.namespace);

  const maxViewsReached = $derived(
    $savedQueries?.[namespace]?.length >= maxQueries,
  );

  const namespaceSavedQueries = $derived(
    sortAlphabetically($savedQueries?.[namespace] || [], (q) => q.name),
  );
  const systemQueryView = $derived(
    (query && systemViews.find((q) => q.query === query)) ||
      (!query && defaultView),
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
  const activeUserView = $derived(
    activeQueryView?.type === 'user' ? activeQueryView : undefined,
  );

  onMount(() => {
    if (savedQueryParam) {
      const queryToSave = {
        name: savedQueryParam,
        query,
        id: Date.now().toString(),
        type: 'user',
      };

      if (!$savedQueries[namespace]) $savedQueries[namespace] = [];

      if (!maxViewsReached) {
        $savedQueries[namespace] = [...$savedQueries[namespace], queryToSave];
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

    if (!query && activeQueryView?.id !== defaultView.id) {
      activeQueryView = defaultView;
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
    if (view.id === activeQueryView?.id) return;
    activeQueryView = view;
    pendingQueryTarget = view.query || '';

    if (view.query) {
      $filters = toListWorkflowFilters(view.query, $searchAttributes);
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
    if (activeQueryView) {
      const sharableViewUrl = new URL(page.url.href);
      sharableViewUrl.searchParams.set('savedQuery', activeQueryView.name);
      copy(e, sharableViewUrl.href);
    }
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

  const onDeleteView = (view: SavedQuery) => {
    $savedQueries[namespace] = $savedQueries[namespace].filter(
      (q) => q?.id !== view.id,
    );
    $filters = [];
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

<div class="flex flex-col">
  <div
    class="surface-primary flex flex-wrap items-center gap-x-3 gap-y-1 border border-b-0 border-subtle p-1.5"
    role="group"
    aria-label="Saved Views"
    data-testid="saved-views-bar"
  >
    <div class="flex flex-wrap items-center gap-1">
      {#each systemViews as view (view.id)}
        {@render queryButton(
          {
            ...view,
            active: query === view.query,
          },
          false,
        )}
      {/each}
    </div>

    <div class="hidden h-6 shrink-0 border-l border-subtle lg:block"></div>

    <div class="flex flex-wrap items-center gap-1">
      <p
        class="flex items-center gap-1.5 whitespace-nowrap pl-1 text-xs font-medium lg:text-sm"
      >
        {translate('common.custom-views')}
        {@render queryBadge({
          className: 'font-mono',
          content: `${namespaceSavedQueries.length}/${maxQueries}`,
        })}
      </p>

      {#if unsavedQuery}
        {@render queryButton(unsaveView, true)}
      {/if}

      {#each namespaceSavedQueries as savedQuery (savedQuery.id)}
        {@render queryButton(
          {
            ...savedQuery,
            active: savedQuery.id === activeQueryView?.id,
            badge:
              savedQuery.id === activeQueryView?.id &&
              savedQuery.query !== query
                ? 'Unsaved'
                : undefined,
          },
          true,
        )}
      {/each}

      {#if namespaceSavedQueries.length === 0 && !unsavedQuery}
        <p class="whitespace-nowrap px-1 text-secondary">No Views</p>
      {/if}
    </div>

    {#if activeUserView}
      <div
        class="ml-auto flex items-center gap-1"
        transition:slide={{ axis: 'x' }}
      >
        {#if activeUserView.query !== query}
          <Button
            size="xs"
            variant="primary"
            data-testid="save-view-button"
            data-track-name="save-view-button"
            data-track-intent="action"
            data-track-text="save"
            onclick={() => {
              onSaveView({
                ...activeUserView,
                query,
              });
            }}>Save</Button
          >
        {/if}
        <Button
          size="xs"
          variant="secondary"
          data-testid="edit-view-button"
          data-track-name="edit-view-button"
          data-track-intent="action"
          data-track-text="edit"
          onclick={() => {
            editViewModalOpen = true;
          }}>Edit</Button
        >
        <Button
          leadingIcon={$copied ? 'checkmark' : 'copy'}
          aria-label="Share"
          size="xs"
          variant="ghost"
          class="opacity-80"
          data-testid="share-view-button"
          data-track-name="share-view-button"
          data-track-intent="action"
          data-track-text="share"
          onclick={handleCopy}>Share</Button
        >
      </div>
    {:else if unsavedQuery}
      <div
        class="ml-auto flex items-center gap-1"
        transition:slide={{ axis: 'x' }}
      >
        <Button
          size="xs"
          variant="secondary"
          disabled={maxViewsReached}
          data-testid="create-view-button"
          data-track-name="create-view-button"
          data-track-intent="action"
          data-track-text="create"
          onclick={() => {
            saveViewModalOpen = true;
          }}>Save as New</Button
        >
      </div>
    {/if}
  </div>

  {@render children()}
</div>
<ViewModal
  id="{id}-save-view-modal"
  bind:open={saveViewModalOpen}
  {onCreateView}
  {savedQueries}
  {maxQueries}
/>
<ViewModal
  id="{id}-edit-view-modal"
  view={activeQueryView}
  bind:open={editViewModalOpen}
  {onSaveView}
  {onCreateView}
  {onDeleteView}
  {savedQueries}
  {maxQueries}
/>

{#snippet queryButton(view: SavedQuery, showLabel: boolean)}
  <Tooltip
    text={view.count != undefined ? `${view.name} • ${view.count}` : view.name}
    bottom
    usePortal
    hide={showLabel && view.count == undefined}
    tooltipClass="max-w-[280px]"
  >
    <Button
      variant="ghost"
      aria-label={view.name}
      data-testid={view.type === 'system'
        ? view.id
        : view.name.toLowerCase().replace(/\s+/g, '-')}
      data-track-name={view.type === 'system'
        ? 'system-query-button'
        : 'user-query-button'}
      data-track-intent="action"
      data-track-text={view.name}
      onclick={() => setActiveQueryView(view)}
      class={merge(
        'max-w-[240px]',
        (view.count ?? 0) > 0 && 'text-red-900 dark:text-red-300',
      )}
      active={view.active}
      disabled={view.disabled}
      size="xs"
    >
      <Icon name={view.icon || 'bookmark'} class="h-4 w-4 flex-shrink-0" />
      {#if showLabel}
        <span class="truncate font-normal">{view.name}</span>
      {/if}
      {#if view.badge}
        {@render queryBadge({
          className: 'italic',
          content: view.badge,
        })}
      {/if}
      {#if view.count != undefined}
        {@render queryBadge({
          className: `font-mono ${view.count > 0 ? 'bg-red-50 dark:bg-red-900 text-red-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-600 text-blue-900 dark:text-white'}`,
          content: view.count,
          icon: view.count > 0 ? 'exclamation-octagon' : 'happy-lappy',
          iconClass:
            view.count > 0
              ? 'bg-red-200 dark:bg-red-700 text-red-900 dark:text-white'
              : 'surface-subtle',
        })}
      {/if}
    </Button>
  </Tooltip>
{/snippet}

{#snippet queryBadge({
  className,
  content,
  iconClass,
  icon,
}: {
  className?: ClassNameValue;
  content: string | number;
  iconClass?: ClassNameValue;
  icon?: IconName;
})}
  <span
    class={merge(
      'surface-subtle flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
      icon && 'gap-1.5 p-0.5 pl-2',
      className,
    )}
  >
    <span class="max-w-16 truncate">{content}</span>
    {#if icon}
      <span class={merge('rounded-full p-0.5', iconClass)}>
        <Icon name={icon} class="p-0.5" />
      </span>
    {/if}
  </span>
{/snippet}
