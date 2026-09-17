<script lang="ts">
  import type { Writable } from 'svelte/store';

  import type { ComponentProps, Snippet } from 'svelte';

  import { page } from '$app/state';

  import TableCellWithFilterOrCopyButtons from '$lib/holocene/table/table-cell-with-filter-or-copy-buttons.svelte';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import {
    createQuickFilter,
    getDefaultConditional,
    isQuickFilterActive,
    type QuickFilterValue,
    toggleQuickFilter,
    toQuickFilterValue,
  } from '$lib/utilities/query/quick-filter';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { MAX_QUERY_LENGTH } from '$lib/utilities/request-from-api';

  interface Props extends Omit<
    ComponentProps<typeof TableCellWithFilterOrCopyButtons>,
    | 'children'
    | 'copyIconTitle'
    | 'copySuccessIconTitle'
    | 'onFilter'
    | 'isFiltered'
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

  const filterValue = $derived(toQuickFilterValue({ attribute, type, value }));
  const isFiltered = $derived(
    isQuickFilterActive($filters, {
      attribute,
      value: filterValue ?? '',
      conditional: getDefaultConditional(type),
    }),
  );

  const onFilter = () => {
    const quickFilter = createQuickFilter({ attribute, type, value });
    if (!quickFilter) return;

    const query = page.url.searchParams.get('query') ?? '';
    if (!isFiltered && query.length >= MAX_QUERY_LENGTH) return;

    $filters = toggleQuickFilter($filters, quickFilter);
    updateQueryParamsFromFilter(page.url, $filters);
  };
</script>

<TableCellWithFilterOrCopyButtons
  {...cellProps}
  onFilter={filterValue === null ? undefined : onFilter}
  {isFiltered}
>
  {@render children()}
</TableCellWithFilterOrCopyButtons>
