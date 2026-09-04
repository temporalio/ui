<script lang="ts" generics="Item">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLTableElement>, 'class'> {
    visibleItems: Item[];
    loading?: boolean;
    updating?: boolean;
    maxHeight?: string;
    fixed?: boolean;
    verticalScroll?: 'responsive' | 'table';
    class?: ClassNameValue;
    tableClass?: string;
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
    verticalScroll = 'responsive',
    class: className = '',
    tableClass = '',
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

  const scrollsInTable = $derived(
    verticalScroll === 'table' || (maxHeight !== '' && maxHeight !== 'none'),
  );

  let tableContainer = $state<HTMLDivElement>();
  let footerHeight = $state(0);

  export function scrollToTop() {
    if (!tableContainer) return;

    if (tableContainer.scrollHeight > tableContainer.clientHeight) {
      tableContainer.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      tableContainer.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }
</script>

{#snippet tableHeaders()}
  {@render headers?.({ visibleItems })}
{/snippet}

<div
  class={merge(
    'flex grow flex-col overflow-auto rounded-lg border border-primary bg-background-primary text-primary',
    className,
  )}
  id="{rest['id']}-container"
  bind:this={tableContainer}
  style:max-height={maxHeight || null}
  style:scroll-padding-top="var(--table-header-h, 2.25rem)"
  style:scroll-padding-bottom="{footerHeight}px"
  style:--table-header-h="2.25rem"
>
  {#if loading}
    {#if loadingContent}
      {@render loadingContent()}
    {:else}
      <SkeletonTable bordered={false} rows={25} />
    {/if}
  {:else}
    <Table
      class={merge('shrink-0 rounded-b-none', tableClass)}
      bordered={false}
      {updating}
      {fixed}
      {caption}
      headers={tableHeaders}
      {...rest}
    >
      {@render children?.()}
    </Table>
    {#if visibleItems.length}
      <div
        class={merge(
          'sticky left-0 flex w-full shrink-0 flex-wrap items-center justify-between gap-2 border-t border-primary bg-surface-primary px-4 py-2 text-primary',
          scrollsInTable ? 'bottom-0 mt-auto' : 'md:bottom-0 md:mt-auto',
        )}
        bind:clientHeight={footerHeight}
      >
        {@render actionsStart?.()}
        {@render actionsCenter?.()}
        {@render actionsEnd?.()}
      </div>
    {:else}
      <div class="sticky left-0 flex w-full grow flex-col justify-center">
        {@render empty?.()}
      </div>
    {/if}
  {/if}
</div>
