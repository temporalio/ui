<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  type Item = $$Generic;

  interface $$Props extends Omit<HTMLAttributes<HTMLTableElement>, 'class'> {
    visibleItems: Item[];
    loading?: boolean;
    updating?: boolean;
    maxHeight?: string;
    fixed?: boolean;
    class?: ClassNameValue;
  }

  export let visibleItems: Item[];
  export let loading = false;
  export let updating = false;
  export let maxHeight = '';
  export let fixed = false;

  let className: ClassNameValue = '';
  export { className as class };

  let tableContainer: HTMLDivElement;

  $: tableOffset = tableContainer?.offsetTop
    ? tableContainer.offsetTop + 32
    : 0;
</script>

<div
  class={merge(
    'surface-primary min-h-[154px] grow overflow-auto border border-subtle',
    className,
  )}
  bind:this={tableContainer}
  style="max-height: {maxHeight || `calc(100vh - ${tableOffset}px)`}"
>
  {#if loading}
    {#if $$slots.loading}
      <slot name="loading" />
    {:else}
      <SkeletonTable bordered={false} rows={15} />
    {/if}
  {:else}
    <Table bordered={false} {updating} {fixed} {...$$restProps}>
      <slot slot="caption" name="caption" />
      <slot slot="headers" name="headers" {visibleItems} />
      <slot />
    </Table>
    {#if visibleItems.length}
      <div
        class="surface-primary sticky bottom-0 left-0 flex w-full grow items-center justify-between gap-2 border-t border-subtle px-4 py-2"
      >
        <slot name="actions-start" />
        <slot name="actions-center" />
        <slot name="actions-end" />
      </div>
    {:else}
      <slot name="empty" />
    {/if}
  {/if}
</div>
