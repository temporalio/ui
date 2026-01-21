<script lang="ts">
  import { slide } from 'svelte/transition';

  import { onMount } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import EditViewModal from '$lib/components/activity/filter-bar/edit-view-modal.svelte';
  import SaveViewModal from '$lib/components/activity/filter-bar/save-view-modal.svelte';
  import Button from '$lib/holocene/button.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { activityRefresh } from '$lib/stores/activities';
  import { activityFilters } from '$lib/stores/filters';
  import { savedQueryNavOpen } from '$lib/stores/nav-open';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    DEFAULT_ACTIVITY_SYSTEM_VIEW,
    MAX_SAVED_ACTIVITY_QUERIES,
    savedActivityQueries,
    type SavedQuery,
    systemActivityViews,
  } from '$lib/stores/saved-queries';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  let activeQueryView: SavedQuery | undefined = $state();
  let saveViewModalOpen = $state(false);
  let editViewModalOpen = $state(false);
  let pendingQueryTarget: string | undefined = $state();

  const query = $derived(page.url.searchParams.get('query') || '');
  const savedQueryParam = page.url.searchParams.get('savedQuery');
  const namespace = $derived(page.params.namespace);

  const maxViewsReached = $derived(
    $savedActivityQueries?.[namespace]?.length >= MAX_SAVED_ACTIVITY_QUERIES,
  );

  const namespaceSavedQueries = $derived(
    $savedActivityQueries?.[namespace]?.sort((a, b) =>
      a.name.localeCompare(b.name),
    ) || [],
  );
  const systemQueryView = $derived(
    (query && systemActivityViews.find((q) => q.query === query)) ||
      (!query && DEFAULT_ACTIVITY_SYSTEM_VIEW),
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

      if (!$savedActivityQueries[namespace])
        $savedActivityQueries[namespace] = [];

      if (!maxViewsReached) {
        $savedActivityQueries[namespace] = [
          ...$savedActivityQueries[namespace],
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

    if (!query && activeQueryView?.id !== DEFAULT_ACTIVITY_SYSTEM_VIEW.id) {
      activeQueryView = DEFAULT_ACTIVITY_SYSTEM_VIEW;
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

  $effect(() => {
    $activityRefresh;
  });

  const setActiveQueryView = (view: SavedQuery) => {
    if (view.id === activeQueryView?.id) return;
    activeQueryView = view;
    pendingQueryTarget = view.query || '';

    if (view.query) {
      $activityFilters = toListWorkflowFilters(view.query, $searchAttributes);
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
    if (!$savedActivityQueries[namespace]) {
      $savedActivityQueries[namespace] = [];
    }

    $savedActivityQueries[namespace] = [
      ...$savedActivityQueries[namespace],
      view,
    ];
    activeQueryView = view;
  };

  const onSaveView = (view: SavedQuery) => {
    if (!$savedActivityQueries[namespace]) {
      $savedActivityQueries[namespace] = [];
    }

    if (view.id === activeQueryView?.id) {
      $savedActivityQueries[namespace] = $savedActivityQueries[namespace].map(
        (q) => (q.id === view.id ? view : q),
      );
    } else {
      $savedActivityQueries[namespace] = [
        ...$savedActivityQueries[namespace],
        view,
      ];
    }
    activeQueryView = view;
  };

  const onDeleteView = (view: SavedQuery) => {
    $savedActivityQueries[namespace] = $savedActivityQueries[namespace].filter(
      (q) => q?.id !== view.id,
    );
    $activityFilters = [];
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
    <div class="pb-2 text-center">
      <div class="space-y-1">
        {#each systemActivityViews as view}
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
        {translate('activities.custom-views')}
        {@render queryBadge({
          className: 'font-mono',
          content: `${namespaceSavedQueries.length}/${MAX_SAVED_ACTIVITY_QUERIES}`,
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
<SaveViewModal bind:open={saveViewModalOpen} {onCreateView} />
<EditViewModal
  view={activeQueryView}
  bind:open={editViewModalOpen}
  {onSaveView}
  {onCreateView}
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
      data-testid={view.type === 'system'
        ? view.id
        : view.name.toLowerCase().replace(/\s+/g, '-')}
      data-track-name={view.type === 'system'
        ? 'system-query-button'
        : 'user-query-button'}
      data-track-intent="action"
      data-track-text={view.name}
      on:click={() => setActiveQueryView(view)}
      class="flex w-full justify-start"
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
          on:click={() => {
            editViewModalOpen = true;
          }}>Edit</Button
        >
        <Button
          leadingIcon={$copied ? 'checkmark' : 'copy'}
          size="xs"
          class="w-full opacity-80"
          variant="ghost"
          data-testid="share-view-button"
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
    {content}
    {#if icon}
      <span class={merge('rounded-full p-0.5', iconClass)}>
        <Icon name={icon} class="p-0.5" />
      </span>
    {/if}
  </span>
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
