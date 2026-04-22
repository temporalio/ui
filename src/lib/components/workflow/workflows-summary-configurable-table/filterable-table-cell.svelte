<script lang="ts">
  import { page } from '$app/state';

  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import Link from '$lib/holocene/link.svelte';
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

  type Props = {
    attribute: string;
    filterOrCopyButtonsVisible: boolean;
    value: string;
    href?: string;
    type?: SearchAttributeType;
    truncate?: boolean;
  };
  let {
    attribute,
    filterOrCopyButtonsVisible = false,
    value,
    href,
    type = SEARCH_ATTRIBUTE_TYPE.KEYWORD,
    truncate = false,
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

{#if href}
  <Tooltip text={value} top class="min-w-0" hide={hideTooltip}>
    <Link {href}>{truncate ? truncateValue(value) : value}</Link>
  </Tooltip>
{:else}
  <Tooltip text={value} top class="min-w-0" hide={hideTooltip}>
    {truncate ? truncateValue(value) : value}
  </Tooltip>
{/if}
<FilterOrCopyButtons
  copyIconTitle={translate('common.copy-icon-title')}
  copySuccessIconTitle={translate('common.copy-success-icon-title')}
  filterIconTitle={translate('common.filter-workflows')}
  show={filterOrCopyButtonsVisible}
  content={value}
  onFilter={onRowFilterClick}
  filtered={$workflowFilters.some(
    (filter) => filter.attribute === attribute && filter.value === value,
  )}
/>
