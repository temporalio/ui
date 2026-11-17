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
    leading?: Snippet;
    children?: Snippet;
    class?: string;
    'data-testid'?: string;
  }

  let {
    column,
    label = column,
    leading,
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

{#snippet heading()}
  {#if sortable}
    <button
      type="button"
      class="group flex min-h-9 w-full items-center gap-2 rounded-sm text-left font-medium hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
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
{/snippet}

<th
  scope="col"
  aria-label={leading ? label : undefined}
  {...rest}
  class={twMerge('relative', className)}
  aria-sort={direction}
>
  {#if leading}
    <div class="flex min-w-0 items-center gap-2">
      {@render leading()}
      <div class="min-w-0 flex-1">
        {@render heading()}
      </div>
    </div>
  {:else}
    {@render heading()}
  {/if}
  {@render children?.()}
</th>
