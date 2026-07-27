<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import Link from '$lib/holocene/link.svelte';
  import TableCellWithFilterOrCopyButtons from '$lib/holocene/table/table-cell-with-filter-or-copy-buttons.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workerFilters } from '$lib/stores/filters';
  import {
    createFilter,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';
  import { truncateValue } from '$lib/utilities/truncate-value';

  interface Props {
    attribute?: string;
    filters?: SearchAttributeFilter[];
    value?: string | null;
    filterable?: boolean;
    href?: string;
    children?: Snippet;
  }

  let {
    attribute,
    filters,
    value,
    filterable = false,
    href,
    children,
  }: Props = $props();

  const matchesFilter = (a: SearchAttributeFilter, b: SearchAttributeFilter) =>
    a.attribute === b.attribute && a.value === b.value;

  const toggleFilters = $derived(
    filters && filters.length > 0
      ? filters
      : [createFilter({ attribute, value: value ?? '', conditional: '=' })],
  );

  const isFiltered = $derived(
    toggleFilters.some((f) =>
      $workerFilters.some((wf) => matchesFilter(wf, f)),
    ),
  );

  const onRowFilterClick = () => {
    const toRemove = toggleFilters.filter((f) =>
      $workerFilters.some((wf) => matchesFilter(wf, f)),
    );
    const toAdd = toggleFilters.filter(
      (f) => !$workerFilters.some((wf) => matchesFilter(wf, f)),
    );

    $workerFilters = [
      ...$workerFilters.filter(
        (wf) => !toRemove.some((f) => matchesFilter(wf, f)),
      ),
      ...toAdd,
    ];

    updateQueryParamsFromFilter(page.url, $workerFilters);
  };

  const hasContent = $derived(
    Boolean(value) || Boolean(filters && filters.length > 0),
  );
</script>

<TableCellWithFilterOrCopyButtons
  class="h-8"
  copyValue={value ?? undefined}
  onFilter={hasContent && filterable ? onRowFilterClick : undefined}
  {isFiltered}
  filterIconTitle={translate('common.filter-workflows')}
>
  {#if attribute === 'BuildId' || attribute === 'WorkerInstanceKey'}
    {#if href}
      <Tooltip text={value ?? undefined} top class="min-w-0">
        <Link {href}>{truncateValue(value)}</Link>
      </Tooltip>
    {:else}
      <Tooltip text={value ?? undefined} top class="min-w-0">
        {truncateValue(value)}
      </Tooltip>
    {/if}
  {:else if href}
    <Link {href}>{value}</Link>
  {:else if children}
    {@render children?.()}
  {:else}
    {value}
  {/if}
</TableCellWithFilterOrCopyButtons>
