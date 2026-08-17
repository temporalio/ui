<script lang="ts" generics="Item">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  import { getPaginatedTableMaxHeight } from './context';

  interface Props extends Omit<HTMLAttributes<HTMLTableElement>, 'class'> {
    visibleItems: Item[];
    loading?: boolean;
    updating?: boolean;
    maxHeight?: string;
    fixed?: boolean;
    class?: ClassNameValue;
    caption?: Snippet;
    headers?: Snippet<[{ visibleItems: Item[] }]>;
    children?: Snippet;
    loadingContent?: Snippet;
    actionsStart?: Snippet;
    actionsCenter?: Snippet;
    actionsEnd?: Snippet;
    empty?: Snippet;
  }

  let {
    visibleItems,
    loading = false,
    updating = false,
    maxHeight = '',
    fixed = false,
    class: className = '',
    caption,
    headers,
    children,
    loadingContent,
    actionsStart,
    actionsCenter,
    actionsEnd,
    empty,
    ...rest
  }: Props = $props();

  const contextMaxHeight = getPaginatedTableMaxHeight();

  let tableContainer = $state<HTMLDivElement>();
  let actionsBar = $state<HTMLDivElement>();
  let actionsHeight = $state(0);

  const constrainedHeight = $derived(maxHeight || contextMaxHeight || '');
  const constrained = $derived(
    !!constrainedHeight && constrainedHeight !== 'none',
  );

  export function scrollToTop() {
    if (!tableContainer) return;

    if (constrained) {
      tableContainer.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const stickyLine = actionsBar
      ? parseFloat(getComputedStyle(actionsBar).top) || 0
      : 0;

    if (tableContainer.getBoundingClientRect().top < stickyLine) {
      tableContainer.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }
</script>

{#snippet tableHeaders()}
  {@render headers?.({ visibleItems })}
{/snippet}

<div
  class={merge(
    'paginated-table-container surface-primary flex min-h-[154px] grow flex-col border border-subtle',
    constrained && 'overflow-auto',
    className,
  )}
  class:constrained
  id="{rest['id']}-container"
  bind:this={tableContainer}
  style:max-height={constrained ? constrainedHeight : null}
  style:--table-actions-h="{actionsHeight}px"
>
  {#if loading}
    {#if loadingContent}
      {@render loadingContent()}
    {:else}
      <SkeletonTable bordered={false} rows={25} />
    {/if}
  {:else}
    {#if visibleItems.length}
      <div
        class="surface-primary sticky left-0 top-[var(--table-sticky-top)] z-10 flex h-12 w-full items-center justify-between gap-2 border-b border-subtle px-4"
        bind:this={actionsBar}
        bind:clientHeight={actionsHeight}
      >
        {@render actionsStart?.()}
        {@render actionsCenter?.()}
        {@render actionsEnd?.()}
      </div>
    {/if}
    <div
      class={merge(
        'flex shrink-0 grow flex-col',
        !constrained && 'overflow-x-auto',
      )}
    >
      <Table
        bordered={false}
        {updating}
        {fixed}
        {caption}
        headers={tableHeaders}
        {...rest}
      >
        {@render children?.()}
      </Table>
      {#if !visibleItems.length}
        <div class="flex w-full shrink-0 grow flex-col">
          {@render empty?.()}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang="postcss">
  .paginated-table-container {
    --table-header-h: 2.25rem;
    --table-sticky-top: var(--scroll-inset-top);
  }

  .paginated-table-container.constrained {
    --table-sticky-top: 0;

    scroll-padding-top: calc(var(--table-header-h) + var(--table-actions-h));
  }

  .paginated-table-container.constrained :global(.holocene-table-header) {
    top: var(--table-actions-h);
  }
</style>
