<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { page } from '$app/state';

  import Link from '$lib/holocene/link.svelte';
  import TableCellWithFilterOrCopyButtons from '$lib/holocene/table/table-cell-with-filter-or-copy-buttons.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import {
    createFilter,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';
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
    value: string;
    href?: string;
    type?: SearchAttributeType;
    truncate?: boolean;
  }
  let {
    attribute,
    value,
    href,
    type = SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    truncate = false,
    ...cellProps
  }: Props = $props();

  const onRowFilterClick = () => {
    const filter = $workflowFilters.find((f) => f.attribute === attribute);
    const getOtherFilters = () =>
      $workflowFilters.filter((f) => f.attribute !== attribute);

    if (!filter || filter.value !== value) {
      const newFilter: SearchAttributeFilter = createFilter({
        attribute,
        type,
        value,
        conditional: '=',
      });
      $workflowFilters = [...getOtherFilters(), newFilter];
    } else {
      $workflowFilters = [...getOtherFilters()];
    }

    updateQueryParamsFromFilter(page.url, $workflowFilters);
  };

  const hideTooltip = $derived(
    !truncate || (truncate && truncateValue(value).length <= TRUNCATE_LENGTH),
  );
</script>

<TableCellWithFilterOrCopyButtons
  {...cellProps}
  density={truncate ? 'dense' : 'comfortable'}
  filterIconTitle={translate('common.filter-workflows')}
  copyValue={value}
  onFilter={onRowFilterClick}
  isFiltered={$workflowFilters.some(
    (filter) => filter.attribute === attribute && filter.value === value,
  )}
>
  <Tooltip usePortal text={value} top class="min-w-0" hide={hideTooltip}>
    {#if href}
      <Link {href}>{truncate ? truncateValue(value) : value}</Link>
    {:else}
      {truncate ? truncateValue(value) : value}
    {/if}
  </Tooltip>
</TableCellWithFilterOrCopyButtons>
