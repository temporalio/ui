<script lang="ts">
  import { page } from '$app/state';

  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { nexusOperationFilters } from '$lib/stores/filters';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import {
    createFilter,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';

  type Props = {
    attribute: string;
    filterOrCopyButtonsVisible: boolean;
    value: string;
    href?: string;
    type?: SearchAttributeType;
  };
  let {
    attribute,
    filterOrCopyButtonsVisible = false,
    value,
    href,
    type = SEARCH_ATTRIBUTE_TYPE.KEYWORD,
  }: Props = $props();

  const onRowFilterClick = () => {
    const filter = $nexusOperationFilters.find(
      (f) => f.attribute === attribute,
    );
    const getOtherFilters = () =>
      $nexusOperationFilters.filter((f) => f.attribute !== attribute);

    if (!filter || filter.value !== value) {
      const newFilter: SearchAttributeFilter = createFilter({
        attribute,
        type,
        value,
        conditional: '=',
      });
      $nexusOperationFilters = [...getOtherFilters(), newFilter];
    } else {
      $nexusOperationFilters = [...getOtherFilters()];
    }

    updateQueryParamsFromFilter(page.url, $nexusOperationFilters);
  };
</script>

{#if href}
  <Link {href}>{value}</Link>
{:else}
  {value}
{/if}
<FilterOrCopyButtons
  copyIconTitle={translate('common.copy-icon-title')}
  copySuccessIconTitle={translate('common.copy-success-icon-title')}
  filterIconTitle={translate('common.filter-nexus-operations')}
  show={filterOrCopyButtonsVisible}
  content={value}
  onFilter={onRowFilterClick}
  filtered={$nexusOperationFilters.some(
    (filter) => filter.attribute === attribute && filter.value === value,
  )}
/>
