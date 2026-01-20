<script lang="ts">
  import { page } from '$app/state';

  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { activityFilters } from '$lib/stores/filters';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

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
    const filter = $activityFilters.find((f) => f.attribute === attribute);
    const getOtherFilters = () =>
      $activityFilters.filter((f) => f.attribute !== attribute);

    if (!filter || filter.value !== value) {
      const newFilter: SearchAttributeFilter = {
        attribute,
        type,
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $activityFilters = [...getOtherFilters(), newFilter];
    } else {
      $activityFilters = [...getOtherFilters()];
    }

    updateQueryParamsFromFilter(page.url, $activityFilters);
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
  filterIconTitle={translate('common.filter-activities')}
  show={filterOrCopyButtonsVisible}
  content={value}
  onFilter={onRowFilterClick}
  filtered={$activityFilters.some(
    (filter) => filter.attribute === attribute && filter.value === value,
  )}
/>
