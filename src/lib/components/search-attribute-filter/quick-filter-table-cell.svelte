<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { type ComponentProps, setContext, type Snippet } from 'svelte';

  import { page } from '$app/state';

  import { Menu } from '$lib/holocene/menu';
  import {
    MENU_CONTEXT,
    type MenuContext,
  } from '$lib/holocene/menu/menu-container.svelte';
  import TableCellWithFilterOrCopyButtons from '$lib/holocene/table/table-cell-with-filter-or-copy-buttons.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import {
    createQuickFilter,
    getQuickFilterConditional,
    isQuickFilterActive,
    type QuickFilterValue,
    requiresOperatorChoice,
    toggleQuickFilter,
    toQuickFilterValue,
  } from '$lib/utilities/query/quick-filter';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { MAX_QUERY_LENGTH } from '$lib/utilities/request-from-api';

  import FilterEditor from './filter-editor.svelte';

  interface Props extends Omit<
    ComponentProps<typeof TableCellWithFilterOrCopyButtons>,
    | 'children'
    | 'copyIconTitle'
    | 'copySuccessIconTitle'
    | 'onFilter'
    | 'isFiltered'
    | 'menuId'
    | 'menuOpen'
  > {
    attribute: string;
    value: QuickFilterValue;
    type?: SearchAttributeType;
    filters: Writable<SearchAttributeFilter[]>;
    children: Snippet;
  }
  let {
    attribute,
    value,
    type = SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    filters,
    children,
    ...cellProps
  }: Props = $props();

  const open = writable(false);
  const menuElement = writable<HTMLUListElement | null>(null);

  // Menu reads its open state from context, which MenuContainer would normally
  // provide — but that renders a div, and a div cannot wrap a table cell.
  setContext<MenuContext>(MENU_CONTEXT, {
    open,
    keepOpen: writable(false),
    menuElement,
  });

  const filterValue = $derived(toQuickFilterValue({ attribute, type, value }));
  const conditional = $derived(getQuickFilterConditional({ attribute, type }));
  const isFiltered = $derived(
    isQuickFilterActive($filters, {
      attribute,
      value: filterValue ?? '',
      conditional,
    }),
  );

  // `=` is what anyone means for a Keyword, Text or Bool, so those filter on a
  // single click. Anywhere else the operator is a guess, so ask instead.
  const needsOperator = $derived(requiresOperatorChoice({ attribute, type }));
  const hasPopup = $derived(needsOperator && filterValue !== null);
  const menuId = $derived(`quick-filter-${attribute}`);

  const atQueryLimit = $derived(
    (page.url.searchParams.get('query') ?? '').length >= MAX_QUERY_LENGTH,
  );

  const replaceFilter = (filter: SearchAttributeFilter) => {
    // Replace rather than append, so a multi-status group collapses and
    // combineFilters can recompute the parentheses from scratch.
    $filters = [
      ...$filters.filter((f) => f.attribute !== filter.attribute),
      filter,
    ];
    updateQueryParamsFromFilter(page.url, $filters);
  };

  const onFilter = () => {
    if (hasPopup) {
      $open = !$open;
      return;
    }

    const quickFilter = createQuickFilter({ attribute, type, value });
    if (!quickFilter) return;
    if (!isFiltered && atQueryLimit) return;

    $filters = toggleQuickFilter($filters, quickFilter);
    updateQueryParamsFromFilter(page.url, $filters);
  };

  // Checked by containment rather than propagation: Svelte delegates events at
  // the app root, so the menu's stopPropagation runs on the same node as this
  // listener and would not suppress it.
  $effect(() => {
    if (!$open) return;

    const dismiss = (e: Event) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if ($menuElement?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest(`[data-menu-anchor="${menuId}"]`)
      )
        return;

      $open = false;
    };
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') $open = false;
    };

    document.addEventListener('click', dismiss);
    document.addEventListener('keydown', onKeydown);

    return () => {
      document.removeEventListener('click', dismiss);
      document.removeEventListener('keydown', onKeydown);
    };
  });
</script>

<TableCellWithFilterOrCopyButtons
  {...cellProps}
  onFilter={filterValue === null ? undefined : onFilter}
  {isFiltered}
  menuId={hasPopup ? menuId : undefined}
  menuOpen={$open}
>
  {@render children()}
  <!-- Mounted only while open: Menu resolves its anchor once, so the filter
       button it anchors to has to already be on the page. It portals out of the
       cell, so nothing invalid is left inside the row. -->
  {#if hasPopup && $open}
    {@const seed = createQuickFilter({ attribute, type, value })}
    {#if seed}
      <Menu
        id={menuId}
        usePortal
        class="max-h-fit w-min min-w-0 max-w-[calc(100dvw-1rem)] p-4"
      >
        <FilterEditor
          filter={seed}
          idPrefix={menuId}
          defaultTimeMode="absolute"
          onApply={(filter) => {
            if (!isFiltered && atQueryLimit) return;
            replaceFilter(filter);
            $open = false;
          }}
        />
      </Menu>
    {/if}
  {/if}
</TableCellWithFilterOrCopyButtons>
