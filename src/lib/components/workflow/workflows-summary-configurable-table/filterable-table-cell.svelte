<script lang="ts">
  import { page } from '$app/stores';

  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { type TextFilterAttributes } from '$lib/models/workflow-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  type Props = {
    attribute: TextFilterAttributes;
    filterOrCopyButtonsVisible: boolean;
    value: string;
    href?: string;
  };
  let {
    attribute,
    filterOrCopyButtonsVisible = false,
    value,
    href,
  }: Props = $props();

  const onRowFilterClick = () => {
    const filter = $workflowFilters.find((f) => f.attribute === attribute);
    const getOtherFilters = () =>
      $workflowFilters.filter((f) => f.attribute !== attribute);

    if (!filter || filter.value !== value) {
      const newFilter: SearchAttributeFilter = {
        attribute,
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), newFilter];
    } else {
      $workflowFilters = [...getOtherFilters()];
    }

    updateQueryParamsFromFilter($page.url, $workflowFilters);
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
  filterIconTitle={translate('common.filter-workflows')}
  show={filterOrCopyButtonsVisible}
  content={value}
  onFilter={onRowFilterClick}
  filtered={$workflowFilters.some(
    (filter) => filter.attribute === attribute && filter.value === value,
  )}
/>
