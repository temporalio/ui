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

  const truncateRunId = (runId: string): string => {
    if (runId.length <= 12) return runId;
    return `${runId.slice(0, 4)}…${runId.slice(-4)}`;
  };

  const shouldTruncate = attribute === 'RunId';
  const displayValue = shouldTruncate ? truncateRunId(value) : value;

  const onRowFilterClick = () => {
    const filter = $workflowFilters.find((f) => f.attribute === attribute);
    const getOtherFilters = () =>
      $workflowFilters.filter((f) => f.attribute !== attribute);

    if (!filter || filter.value !== value) {
      const newFilter: SearchAttributeFilter = {
        attribute,
        type,
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), newFilter];
    } else {
      $workflowFilters = [...getOtherFilters()];
    }

    updateQueryParamsFromFilter(page.url, $workflowFilters);
  };
</script>

{#if shouldTruncate}
  <Tooltip text={value} top>
    {#if href}
      <Link {href} class="cursor-help font-mono text-sm">{displayValue}</Link>
    {:else}
      <span class="cursor-help font-mono text-sm">{displayValue}</span>
    {/if}
  </Tooltip>
{:else if href}
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
