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
  import { savedQueryNavOpen } from '$lib/stores/nav-open';
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

<div class="flex overflow-auto">
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
          <Icon name="collapse" />
        </button>
      </div>
    </div>

    <div class="space-y-2 p-1.5">
      <div class="pb-2 text-center">
        <div class="space-y-1">
          {#each systemViews as view (view.id)}
            {@render queryButton({
              ...view,
              active: query === view.query,
            })}
          {/each}
        </div>
      </div>

      {#if $savedQueryNavOpen}
        <p
          class="hidden items-center justify-between whitespace-nowrap px-2 text-xs font-medium leading-3 lg:flex lg:text-sm"
          in:slide
        >
          {translate('common.custom-views')}
          {@render queryBadge({
            className: 'font-mono',
            content: `${namespaceSavedQueries.length}/${maxQueries}`,
          })}
        </p>
      {/if}

      <div class="border-t border-subtle"></div>

      {#if unsavedQuery}
        {@render queryButton(unsaveView)}
      {/if}

      {#if namespaceSavedQueries.length > 0}
        <div class="text-center">
          <div class="space-y-1">
            {#each namespaceSavedQueries as savedQuery (savedQuery.id)}
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
        <p
          class={merge(
            ' pl-1 text-center text-secondary lg:pl-4 lg:text-left',
            !$savedQueryNavOpen && 'lg:pl-1 lg:text-center',
          )}
        >
          No Views
        </p>
      {/if}
    </div>
  </div>
  <div
    class={merge(
      'flex w-[calc(100%-var(--panel-collapsed-w))] shrink flex-col transition-all lg:w-[calc(100%-var(--panel-expanded-w))]',
      !$savedQueryNavOpen && 'lg:w-[calc(100%-var(--panel-collapsed-w))]',
    )}
  >
    {@render children()}
  </div>
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

{#snippet queryButton(view: SavedQuery)}
  <Tooltip
    text={view.count != undefined ? `${view.name} • ${view.count}` : view.name}
    right
    usePortal
    hide={$savedQueryNavOpen}
    class="w-full"
    tooltipClass="max-w-[280px]"
  >
    <div class="w-full" role="menuitem" tabindex="-1">
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
        on:click={() => setActiveQueryView(view)}
        class={merge(
          'flex w-full justify-start',
          (view.count ?? 0) > 0 && 'text-red-900 dark:text-red-300',
        )}
        active={view.active}
        disabled={view.disabled}
        size="sm"
      >
        <Icon
          name={view.icon || 'bookmark'}
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
        {/if}
      </Button>

      {#if activeQueryView?.id === view.id && view.type === 'user'}
        <div
          in:slide
          class={merge(
            'flex flex-col items-center gap-1 pt-0.5 transition-all',
            $savedQueryNavOpen && 'lg:flex-row',
          )}
        >
          {#if view.id === activeQueryView?.id && view.query !== query}
            <Button
              size="xs"
              class="w-full"
              variant="primary"
              data-testid="save-view-button"
              data-track-name="save-view-button"
              data-track-intent="action"
              data-track-text="save"
              on:click={() => {
                onSaveView({
                  ...view,
                  query,
                });
              }}>Save</Button
            >
          {/if}
          <Button
            size="xs"
            class="w-full"
            variant="secondary"
            data-testid="edit-view-button"
            data-track-name="edit-view-button"
            data-track-intent="action"
            data-track-text="edit"
            on:click={() => {
              editViewModalOpen = true;
            }}>Edit</Button
          >
          <Button
            leadingIcon={$copied ? 'checkmark' : 'copy'}
            aria-label="Share"
            size="xs"
            class="w-full opacity-80"
            variant="ghost"
            data-testid="share-view-button"
            data-track-name="share-view-button"
            data-track-intent="action"
            data-track-text="share"
            on:click={handleCopy}
            ><span class={merge('hidden', $savedQueryNavOpen && 'lg:inline')}
              >Share</span
            ></Button
          >
        </div>
      {:else if unsavedQuery && view.id === 'unsaved'}
        <div
          class="flex items-center gap-1 overflow-hidden pt-0.5"
          transition:slide
        >
          <Button
            size="xs"
            class="w-full break-all transition-all"
            variant="secondary"
            disabled={maxViewsReached}
            data-testid="create-view-button"
            data-track-name="create-view-button"
            data-track-intent="action"
            data-track-text="create"
            on:click={() => {
              saveViewModalOpen = true;
            }}
            ><span
              class={merge(
                'inline lg:hidden',
                !$savedQueryNavOpen && 'lg:inline',
              )}>New</span
            ><span class={merge('hidden', $savedQueryNavOpen && 'lg:inline')}
              >Save as New</span
            ></Button
          >
        </div>
      {/if}
    </div>
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
      'surface-subtle right-2 top-2 hidden items-center rounded-full px-2 py-1 text-xs font-medium lg:static lg:ml-auto lg:flex',
      icon && 'gap-1.5 p-0.5 pl-2',
      className,
    )}
    in:slide
  >
    <span class="max-w-16 truncate">{content}</span>
    {#if icon}
      <span class={merge('rounded-full p-0.5', iconClass)}>
        <Icon name={icon} class="p-0.5" />
      </span>
    {/if}
  </span>
{/snippet}
