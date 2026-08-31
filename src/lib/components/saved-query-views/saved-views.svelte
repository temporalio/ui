<script lang="ts">
  import type { Readable, Writable } from 'svelte/store';

  import { onMount } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconBookmark, IconCheckmark, IconLink } from '$lib/io/icon';
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

  import SavedViewsMenu from './saved-views-menu.svelte';
  import ViewModal from './view-modal.svelte';

  interface Props {
    filters: Writable<SearchAttributeFilter[]>;
    savedQueries: Writable<Record<string, SavedQuery[]>>;
    systemViews: SavedQuery[];
    defaultView: SavedQuery;
    maxQueries?: number;
    searchAttributes: Readable<SearchAttributes>;
    id: string;
  }

  let {
    filters,
    savedQueries,
    systemViews,
    defaultView,
    maxQueries = MAX_SAVED_QUERIES,
    searchAttributes,
    id,
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
  const unsavedView: SavedQuery = $derived({
    id: 'unsaved',
    name: translate('common.unsaved-view'),
    query,
    Icon: IconBookmark,
    badge: translate('common.unsaved'),
    type: 'system',
    active: true,
  });
  const unsavedQuery = $derived(query && activeQueryView?.id === 'unsaved');
  const activeUserView = $derived(
    activeQueryView?.type === 'user' ? activeQueryView : undefined,
  );
  const activeUserViewDirty = $derived(
    Boolean(activeUserView) &&
      Boolean(query) &&
      activeUserView?.query !== query,
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
      activeQueryView = unsavedView;
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
          activeQueryView = unsavedView;
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

  const onDuplicateView = () => {
    if (!activeUserView) return;

    const base = activeUserView.name.trim();
    const exists = (n: string) =>
      namespaceSavedQueries.some(
        (q) => q.type === 'user' && q.name.toLowerCase() === n.toLowerCase(),
      );

    let candidate = `${base}-copy`;
    let i = 2;
    while (exists(candidate)) {
      candidate = `${base}-copy-${i++}`;
    }

    onCreateView({
      id: Date.now().toString(),
      name: candidate,
      query,
      type: 'user',
    });
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

<div
  class="surface-primary flex flex-wrap items-center gap-x-3 gap-y-1 border-x border-t border-subtle p-1.5 lg:flex-nowrap"
  role="group"
  aria-label={translate('common.saved-views')}
  data-testid="saved-views-bar"
>
  <div class="flex max-w-full shrink-0 flex-wrap items-center gap-1">
    {#each systemViews as view (view.id)}
      {@render queryButton({
        ...view,
        active: query === view.query,
      })}
    {/each}
  </div>

  <div class="hidden h-6 shrink-0 border-l border-subtle lg:block"></div>

  <div class="flex min-w-0 grow flex-wrap items-center gap-1 lg:flex-nowrap">
    <SavedViewsMenu
      {id}
      views={namespaceSavedQueries}
      activeView={activeQueryView}
      draftView={unsavedQuery ? unsavedView : undefined}
      dirty={activeUserViewDirty}
      {maxQueries}
      onSelect={setActiveQueryView}
    />

    {#if activeUserView}
      <div class="flex shrink-0 items-center gap-1">
        {#if activeUserViewDirty}
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
            }}>{translate('common.save')}</Button
          >
        {/if}
        <Button
          size="xs"
          variant="ghost"
          data-testid="edit-view-button"
          data-track-name="edit-view-button"
          data-track-intent="action"
          data-track-text="edit"
          onclick={() => {
            editViewModalOpen = true;
          }}>{translate('common.edit')}</Button
        >
        <Button
          size="xs"
          variant="ghost"
          disabled={maxViewsReached}
          data-testid="duplicate-view-button"
          data-track-name="duplicate-view-button"
          data-track-intent="action"
          data-track-text="duplicate"
          onclick={onDuplicateView}>{translate('common.duplicate')}</Button
        >
        <Button
          LeadingIcon={$copied ? IconCheckmark : IconLink}
          aria-label={translate('common.share')}
          size="xs"
          variant="ghost"
          class="opacity-80"
          data-testid="share-view-button"
          data-track-name="share-view-button"
          data-track-intent="action"
          data-track-text="share"
          onclick={handleCopy}
          >{$copied
            ? translate('common.copied')
            : translate('common.share')}</Button
        >
      </div>
    {:else if unsavedQuery}
      <div class="flex shrink-0 items-center gap-1">
        <Button
          size="xs"
          variant="ghost"
          disabled={maxViewsReached}
          data-testid="create-view-button"
          data-track-name="create-view-button"
          data-track-intent="action"
          data-track-text="create"
          onclick={() => {
            saveViewModalOpen = true;
          }}>{translate('common.save-as-new')}</Button
        >
      </div>
    {/if}
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
    bottom
    usePortal
    tooltipClass="max-w-[280px] xl:hidden"
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
      {@const Glyph = view.Icon || IconBookmark}
      <Glyph class="h-4 w-4 flex-shrink-0" />
      <span class="hidden truncate font-normal xl:inline-block"
        >{view.name}</span
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
        })}
      {/if}
    </Button>
  </Tooltip>
{/snippet}

{#snippet queryBadge({
  className,
  content,
}: {
  className?: ClassNameValue;
  content: string | number;
})}
  <span
    class={merge(
      'surface-subtle flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
      className,
    )}
  >
    <span class="max-w-16 truncate">{content}</span>
  </span>
{/snippet}
