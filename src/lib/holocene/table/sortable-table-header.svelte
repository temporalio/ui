<script lang="ts">
  import type { HTMLThAttributes } from 'svelte/elements';

  import { getContext, type Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import { translate } from '$lib/i18n/translate';
  import { IconArrowAscending, IconArrowDescending } from '$lib/io/icon';

  import {
    TABLE_SORT_CONTEXT,
    type TableSortContext,
  } from './table-sort-context';

  interface Props extends HTMLThAttributes {
    column: string;
    label?: string;
    children?: Snippet;
    class?: string;
    'data-testid'?: string;
  }

  let {
    column,
    label = column,
    children,
    class: className,
    ...rest
  }: Props = $props();
  const sorting = getContext<TableSortContext | undefined>(TABLE_SORT_CONTEXT);
  const sortable = $derived(sorting?.isSortable(column) ?? false);
  const direction = $derived(sortable ? sorting?.direction(column) : undefined);
  const nextDirection = $derived(
    direction === 'ascending' ? 'descending' : 'ascending',
  );
</script>

<th
  scope="col"
  {...rest}
  class={twMerge('relative', className)}
  aria-sort={direction}
>
  {#if sortable}
    <button
      type="button"
      class="group flex min-h-9 w-full items-center gap-2 rounded-sm text-left font-medium hover:text-brand focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:outline-none"
      title={translate(`common.sort-page-${nextDirection}`, { column: label })}
      onclick={() => sorting?.toggle(column)}
      onkeydown={(event) => event.stopPropagation()}
    >
      <span class="truncate">{label}</span>
      <span
        class={twMerge(
          'flex shrink-0',
          !direction &&
            'invisible group-hover:visible group-focus-visible:visible',
        )}
      >
        {#if direction === 'descending'}
          <IconArrowDescending />
        {:else}
          <IconArrowAscending />
        {/if}
      </span>
    </button>
  {:else}
    <span class="block truncate">{label}</span>
  {/if}
  {@render children?.()}
</th>
