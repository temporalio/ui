<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { page } from '$app/state';

  import Link from '$lib/holocene/link.svelte';
  import TableCellWithFilterOrCopyButtons from '$lib/holocene/table/table-cell-with-filter-or-copy-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { activityFilters } from '$lib/stores/filters';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import {
    createFilter,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';

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
  }
  let {
    attribute,
    value,
    href,
    type = SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    ...cellProps
  }: Props = $props();

  const onRowFilterClick = () => {
    const filter = $activityFilters.find((f) => f.attribute === attribute);
    const getOtherFilters = () =>
      $activityFilters.filter((f) => f.attribute !== attribute);

    if (!filter || filter.value !== value) {
      const newFilter: SearchAttributeFilter = createFilter({
        attribute,
        type,
        value,
        conditional: '=',
      });
      $activityFilters = [...getOtherFilters(), newFilter];
    } else {
      $activityFilters = [...getOtherFilters()];
    }

    updateQueryParamsFromFilter(page.url, $activityFilters);
  };
</script>

<TableCellWithFilterOrCopyButtons
  {...cellProps}
  filterIconTitle={translate('common.filter-activities')}
  copyValue={value}
  onFilter={onRowFilterClick}
  isFiltered={$activityFilters.some(
    (filter) => filter.attribute === attribute && filter.value === value,
  )}
>
  {#if href}
    <Link {href}>{value}</Link>
  {:else}
    {value}
  {/if}
</TableCellWithFilterOrCopyButtons>
