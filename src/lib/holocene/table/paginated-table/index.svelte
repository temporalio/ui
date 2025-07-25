<script lang="ts">
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  type Item = $$Generic;

  export let visibleItems: Item[];
  export let variant: 'primary' | 'split' = 'primary';
  export let loading = false;
  export let updating = false;
  export let maxHeight = '';
  export let fixed = false;
  export let id: string = null;

  let tableContainer: HTMLDivElement;

  $: tableOffset = tableContainer?.offsetTop
    ? tableContainer?.offsetTop + 32
    : 0;
</script>

<div
  class="paginated-table-wrapper {variant}"
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
    <Table bordered={false} {variant} {updating} {fixed} {id}>
      <slot slot="caption" name="caption" />
      <slot slot="headers" name="headers" {visibleItems} />
      <slot />
    </Table>
    {#if visibleItems.length}
      <div class="paginated-table-controls">
        <slot name="actions-start" />
        <slot name="actions-center" />
        <slot name="actions-end" />
      </div>
    {:else}
      <slot name="empty" />
    {/if}
  {/if}
</div>

<style lang="postcss">
  .paginated-table-wrapper {
    @apply surface-primary min-h-[154px] grow overflow-auto;

    &.primary {
      @apply border border-subtle;
    }

    &.split {
      @apply border-t border-subtle;
    }
  }

  .paginated-table-controls {
    @apply surface-primary sticky bottom-0 left-0 flex w-full grow items-center justify-between gap-2 border-t border-subtle px-4 py-2;
  }
</style>
