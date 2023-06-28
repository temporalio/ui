<script lang="ts" generics="Item">
  import { pagination } from '$lib/stores/pagination';

  import Icon from '../icon/icon.svelte';
  import SimpleSelect from '../select/simple-select.svelte';
  import SimpleOption from '../select/simple-option.svelte';

  export let items: Item[];
  export let perPage: string = '20';
  export let startingIndex: number = 0;

  $: store = pagination(items, perPage, startingIndex);
  $: current = $store.currentPage;
  $: shortcuts = $store.pageShortcuts;

  const handlePageSizeChange = (event: Event) => {
    const { value } = event.target as HTMLSelectElement;
    perPage = value;
    store.adjustPageSize(value);
  };
</script>

<div class="paginated-table-wrapper">
  <table class="paginated-table">
    <thead class="paginated-table-header">
      <slot name="headers" />
    </thead>
    <tbody class="paginated-table-body">
      <slot visibleItems={$store.items} />
    </tbody>
  </table>
  <div class="paginated-table-controls">
    <div class="flex flex-row items-center justify-start mx-8">
      <SimpleSelect
        on:change={handlePageSizeChange}
        class="w-40"
        value={perPage}
        id="paginated-table-page-size-select"
      >
        <SimpleOption value="20">20</SimpleOption>
        <SimpleOption value="100">100</SimpleOption>
        <SimpleOption value="250">250</SimpleOption>
        <SimpleOption value="500">500</SimpleOption>
      </SimpleSelect>
    </div>
    <div class="flex flex-row items-center justify-center gap-2">
      {#each shortcuts as page}
        {#if isNaN(page)}
          <span>...</span>
        {:else}
          <button
            class="page-btn"
            class:active={page === current}
            on:click={() => store.jumpToPage(page)}>{page}</button
          >
        {/if}
      {/each}
    </div>
    <div class="flex flex-row items-center justify-end mx-8 gap-2">
      <button
        disabled={!$store.hasPrevious}
        on:click={() => store.previous()}
        class="nav-btn"><Icon name="arrow-left" /></button
      >
      <button
        disabled={!$store.hasNext}
        on:click={() => store.next()}
        class="nav-btn"><Icon name="arrow-right" /></button
      >
    </div>
  </div>
</div>

<style lang="postcss">
  .paginated-table-wrapper {
    @apply relative flex flex-col w-full h-auto border-2 border-primary rounded-lg overflow-y-auto;
  }

  .paginated-table {
    @apply table-auto w-full h-fit;
  }

  .paginated-table-header {
    @apply sticky top-0 z-10;

    :global(tr) {
      @apply bg-primary text-white h-10;
    }

    :global(tr > th) {
      @apply first-of-type:rounded-tl last-of-type:rounded-tr;
    }
  }

  .paginated-table-body {
    @apply bg-white;

    :global(tr) {
      @apply h-12 border-b border-primary cursor-pointer last-of-type:border-0 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 hover:bg-fixed;
    }

    :global(tr > td > .table-link) {
      @apply hover:text-blue-700 hover:underline hover:decoration-blue-700;
    }
  }

  .paginated-table-controls {
    @apply sticky z-10 grid grid-cols-3 w-full rounded-b bottom-0 left-0 py-4 bg-white text-primary border-t border-gray-200;
  }

  .page-btn {
    @apply w-10 h-10 rounded-lg bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:border-2 focus:border-blue-500;
  }

  .page-btn.active {
    @apply bg-primary text-white border-none;
  }

  .nav-btn {
    @apply border border-gray-300 text-gray-700 rounded-lg w-10 h-10 flex items-center justify-center disabled:bg-gray-100 disabled:text-gray-500 disabled:pointer-events-none;
  }
</style>
