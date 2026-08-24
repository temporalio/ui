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

  let tableContainer = $state<HTMLDivElement>();
  let footerHeight = $state(0);

  const tableOffset = $derived(
    tableContainer?.offsetTop ? tableContainer.offsetTop + 32 : 0,
  );

  export function scrollToTop() {
    tableContainer?.scrollTo({ top: 0, behavior: 'instant' });
  }
</script>

{#snippet tableHeaders()}
  {@render headers?.({ visibleItems })}
{/snippet}

<div
  class={merge(
    'surface-primary min-h-[154px] grow overflow-auto border border-subtle',
    className,
  )}
  id="{rest['id']}-container"
  bind:this={tableContainer}
  style="max-height: {maxHeight ||
    `calc(100vh - var(--layout-pt) - ${tableOffset}px)`};
  scroll-padding-top: var(--table-header-h, 2.25rem);
  scroll-padding-bottom: {footerHeight}px;

  --table-header-h: 2.25rem;"
>
  {#if loading}
    {#if loadingContent}
      {@render loadingContent()}
    {:else}
      <SkeletonTable bordered={false} rows={25} />
    {/if}
  {:else}
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
    {#if visibleItems.length}
      <div
        class="surface-primary sticky bottom-0 left-0 flex w-full grow items-center justify-between gap-2 border-t border-subtle px-4 py-2"
        bind:clientHeight={footerHeight}
      >
        {@render actionsStart?.()}
        {@render actionsCenter?.()}
        {@render actionsEnd?.()}
      </div>
    {:else}
      <div style="height: calc(100% - var(--table-header-h));">
        {@render empty?.()}
      </div>
    {/if}
  {/if}
</div>
