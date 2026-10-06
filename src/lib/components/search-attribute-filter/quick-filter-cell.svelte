<script lang="ts" generics="Row">
  import type { Writable } from 'svelte/store';

  import type { Snippet } from 'svelte';

  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import type { SearchAttributes } from '$lib/types/workflows';
  import {
    type QuickFilterColumns,
    type ResolvedQuickFilter,
    resolveQuickFilter,
  } from '$lib/utilities/query/quick-filter-table';

  import QuickFilterTableCell from './quick-filter-table-cell.svelte';

  type Props = {
    columns: QuickFilterColumns<Row>;
    searchAttributes: SearchAttributes;
    filters: Writable<SearchAttributeFilter[]>;
    filterIconTitle: string;
    label: string;
    row: Row;
    // Withholds the filter without changing how the cell renders, for a surface
    // whose query language cannot support it.
    disabled?: boolean;
    class?: string;
    style?: string;
    'data-testid'?: string;
    children: Snippet<[ResolvedQuickFilter]>;
  };

  let {
    columns,
    searchAttributes,
    filters,
    filterIconTitle,
    label,
    row,
    disabled = false,
    class: className,
    style,
    'data-testid': testId,
    children,
  }: Props = $props();

  const resolved = $derived(
    resolveQuickFilter({ columns, searchAttributes, label, row }),
  );
</script>

{#if resolved.filterable && !disabled}
  <QuickFilterTableCell
    class={className}
    {style}
    data-testid={testId}
    {filters}
    {filterIconTitle}
    attribute={resolved.attribute}
    type={resolved.type}
    value={resolved.value}
    copyValue={resolved.displayValue}
  >
    {@render children(resolved)}
  </QuickFilterTableCell>
{:else}
  <td class={className} {style} data-testid={testId}>
    {@render children(resolved)}
  </td>
{/if}
