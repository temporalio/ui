<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import Link from '$lib/holocene/link.svelte';
  import TableCellWithFilterOrCopyButtons from '$lib/holocene/table/table-cell-with-filter-or-copy-buttons.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workerFilters } from '$lib/stores/filters';
  import { workerSearchAttributes } from '$lib/stores/search-attributes';
  import {
    createQuickFilter,
    getDefaultConditional,
    isQuickFilterActive,
    type QuickFilterValue,
    toggleQuickFilter,
    toQuickFilterValue,
  } from '$lib/utilities/query/quick-filter';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { truncateValue } from '$lib/utilities/truncate-value';

  interface Props {
    attribute?: string;
    filters?: SearchAttributeFilter[];
    value?: string | null;
    // The value to filter on when it differs from what the cell displays, such
    // as a timestamp rendered in the user's time format.
    rawValue?: QuickFilterValue;
    filterable?: boolean;
    href?: string;
    children?: Snippet;
  }

  let {
    attribute,
    filters,
    value,
    rawValue,
    filterable = false,
    href,
    children,
  }: Props = $props();

  const type = $derived(
    attribute ? $workerSearchAttributes[attribute] : undefined,
  );
  const filterValue = $derived(rawValue ?? value);
  const quickFilterValue = $derived(
    toQuickFilterValue({
      attribute: attribute ?? '',
      type,
      value: filterValue,
    }),
  );

  const matchesFilter = (a: SearchAttributeFilter, b: SearchAttributeFilter) =>
    a.attribute === b.attribute &&
    a.value === b.value &&
    a.conditional === b.conditional;

  const filterList = $derived(filters ?? []);
  const hasMultipleFilters = $derived(filterList.length > 0);

  const isFiltered = $derived(
    hasMultipleFilters
      ? filterList.some((f) =>
          $workerFilters.some((wf) => matchesFilter(wf, f)),
        )
      : isQuickFilterActive($workerFilters, {
          attribute: attribute ?? '',
          value: quickFilterValue ?? '',
          conditional: getDefaultConditional(type),
        }),
  );

  const onRowFilterClick = () => {
    if (!hasMultipleFilters) {
      const quickFilter = createQuickFilter({
        attribute: attribute ?? '',
        type,
        value: filterValue,
      });
      if (!quickFilter) return;

      $workerFilters = toggleQuickFilter($workerFilters, quickFilter);
      updateQueryParamsFromFilter(page.url, $workerFilters);
      return;
    }

    const toRemove = filterList.filter((f) =>
      $workerFilters.some((wf) => matchesFilter(wf, f)),
    );
    const toAdd = filterList.filter(
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

  const hasContent = $derived(hasMultipleFilters || quickFilterValue !== null);
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
