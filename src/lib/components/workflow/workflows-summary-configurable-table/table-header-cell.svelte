<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { supportsAdvancedVisibilityWithOrderBy } from '$lib/stores/advanced-visibility';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { currentPageKey } from '$lib/stores/pagination';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import {
    SORT_COLUMN_PARAM,
    SORT_ORDER_PARAM,
    type SortOrder,
    toSortAttribute,
    toWorkflowSort,
  } from '$lib/utilities/query/order-by';
  import { updateMultipleQueryParameters } from '$lib/utilities/update-query-parameters';

  interface Props {
    column: ConfigurableTableHeader;
    children?: Snippet;
  }

  let { children, column }: Props = $props();
  let { label } = $derived(column);

  const sortAttribute = $derived(toSortAttribute(label, $searchAttributes));
  const sortable = $derived(
    !!sortAttribute && $supportsAdvancedVisibilityWithOrderBy,
  );

  const sort = $derived(toWorkflowSort(page.url.searchParams));
  const order = $derived(
    sortable && sort && sort.attribute === sortAttribute
      ? sort.order
      : undefined,
  );

  const nextOrder = (current: SortOrder | undefined): SortOrder | undefined => {
    if (current === undefined) return 'desc';
    if (current === 'desc') return 'asc';
    return undefined;
  };

  const onSort = () => {
    const next = nextOrder(order);
    updateMultipleQueryParameters({
      url: page.url,
      parameters: [
        { parameter: SORT_COLUMN_PARAM, value: next ? sortAttribute : '' },
        { parameter: SORT_ORDER_PARAM, value: next ?? '' },
      ],
      clearParameters: [currentPageKey],
    });
  };

  const ariaSort = $derived.by(() => {
    if (order === 'asc') return 'ascending';
    if (order === 'desc') return 'descending';
    return sortable ? 'none' : undefined;
  });
</script>

<th
  scope="col"
  aria-sort={ariaSort}
  data-testid="workflows-summary-table-header-cell-{label}"
>
  <div class="flex items-center gap-2">
    {#if sortable}
      <button
        type="button"
        class="group flex items-center gap-1 whitespace-nowrap"
        onclick={onSort}
        data-testid="workflows-summary-table-header-sort-{label}"
        aria-label={translate('workflows.sort-by-column', { column: label })}
      >
        {label}
        <Icon
          name={order === 'asc' ? 'ascending' : 'descending'}
          class={order
            ? 'text-primary'
            : 'text-subtle opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'}
        />
      </button>
    {:else}
      {label}
    {/if}
    {@render children?.()}
  </div>
</th>
