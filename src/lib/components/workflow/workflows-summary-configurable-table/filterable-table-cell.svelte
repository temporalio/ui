<script lang="ts">
  import type { ComponentProps, Snippet } from 'svelte';

  import { page } from '$app/state';

  import Link from '$lib/holocene/link.svelte';
  import TableCellWithFilterOrCopyButtons from '$lib/holocene/table/table-cell-with-filter-or-copy-buttons.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowFilters } from '$lib/stores/filters';
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
  import {
    TRUNCATE_LENGTH,
    truncateValue,
  } from '$lib/utilities/truncate-value';

  interface Props extends Omit<
    ComponentProps<typeof TableCellWithFilterOrCopyButtons>,
    | 'children'
    | 'filterIconTitle'
    | 'copyIconTitle'
    | 'copySuccessIconTitle'
    | 'copyValue'
    | 'onFilter'
    | 'isFiltered'
  > {
    attribute: string;
    value: QuickFilterValue;
    copyValue?: string;
    href?: string;
    type?: SearchAttributeType;
    truncate?: boolean;
    children?: Snippet;
  }
  let {
    attribute,
    value,
    copyValue,
    href,
    type = SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    truncate = false,
    children,
    ...cellProps
  }: Props = $props();

  const displayValue = $derived(copyValue ?? (value ? String(value) : ''));
  const filterValue = $derived(toQuickFilterValue({ attribute, type, value }));
  const isFiltered = $derived(
    isQuickFilterActive($workflowFilters, {
      attribute,
      value: filterValue ?? '',
      conditional: getDefaultConditional(type),
    }),
  );

  const onRowFilterClick = () => {
    const quickFilter = createQuickFilter({ attribute, type, value });
    if (!quickFilter) return;

    const query = page.url.searchParams.get('query') ?? '';
    if (!isFiltered && query.length >= MAX_QUERY_LENGTH) return;

    $workflowFilters = toggleQuickFilter($workflowFilters, quickFilter);
    updateQueryParamsFromFilter(page.url, $workflowFilters);
  };

  const hideTooltip = $derived(
    !truncate ||
      (truncate && truncateValue(displayValue).length <= TRUNCATE_LENGTH),
  );
</script>

<TableCellWithFilterOrCopyButtons
  {...cellProps}
  density={truncate ? 'dense' : 'comfortable'}
  filterIconTitle={translate('common.filter-workflows')}
  copyValue={displayValue}
  onFilter={filterValue === null ? undefined : onRowFilterClick}
  {isFiltered}
>
  {#if children}
    {@render children()}
  {:else}
    <Tooltip
      usePortal
      text={displayValue}
      top
      class="min-w-0"
      hide={hideTooltip}
    >
      {#if href}
        <Link {href}
          >{truncate ? truncateValue(displayValue) : displayValue}</Link
        >
      {:else}
        {truncate ? truncateValue(displayValue) : displayValue}
      {/if}
    </Tooltip>
  {/if}
</TableCellWithFilterOrCopyButtons>
