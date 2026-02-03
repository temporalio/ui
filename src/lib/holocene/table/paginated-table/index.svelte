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
</script>

<div
  class={merge(
    'surface-primary overflow-x-auto border border-subtle',
    className,
  )}
  style={maxHeight
    ? `max-height: ${maxHeight}; --table-header-h: 2.25rem;`
    : '--table-header-h: 2.25rem;'}
>
  {#if loading}
    {#if $$slots.loading}
      <slot name="loading" />
    {:else}
      <SkeletonTable bordered={false} rows={25} />
    {/if}
  {:else}
    {#if visibleItems.length}
      <div
        class="surface-primary flex w-full items-center justify-between gap-2 border-b border-subtle px-4 py-2"
      >
        <slot name="actions-start" />
        <slot name="actions-center" />
        <slot name="actions-end" />
      </div>
    {/if}
    <Table bordered={false} {updating} {fixed} {...$$restProps}>
      <slot slot="caption" name="caption" />
      <slot slot="headers" name="headers" {visibleItems} />
      <slot />
    </Table>
    {#if visibleItems.length}
      <div
        class="surface-primary flex w-full items-center justify-between gap-2 border-t border-subtle px-4 py-2"
      >
        <slot name="actions-start" />
        <slot name="actions-center" />
        <slot name="actions-end" />
      </div>
    {:else}
      <div style="height: calc(100% - var(--table-header-h));">
        <slot name="empty" />
      </div>
    {/if}
  {/if}
</div>
