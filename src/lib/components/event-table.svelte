<script lang="ts">
  import Pagination from './pagination.svelte';
  import Event from './event.svelte';
  import HistoryTable from './history-table.svelte';

  export let events: IterableEvents;
</script>

<Pagination items={[...events]} let:visibleItems>
  <section
    class="flex flex-col border-2 border-gray-300 rounded-lg w-full event-history mb-6"
  >
    <div class="flex w-full">
      <header class="table-header border-r-2 rounded-tl-lg w-1/3">
        <h3>Summary</h3>
        <slot name="filters" />
      </header>
      <header class="table-header rounded-tr-lg w-2/3">
        <h3>Details</h3>
      </header>
    </div>
    <div class="flex h-full overflow-y-hidden">
      <div
        class="flex flex-col h-full w-1/3 border-r-2 border-gray-300 rounded-bl-lg"
      >
        <div class="h-full rounded-bl-lg overflow-y-scroll">
          {#each visibleItems as event (event.id)}
            <Event {event} />
          {/each}
        </div>
      </div>
      <div class="flex flex-col h-full w-2/3">
        <div
          class="h-full  overflow-y-scroll overflow-x-hidden rounded-br-lg px-4"
        >
          <slot name="details">
            <div class="flex items-center justify-center w-full h-full">
              <p class="text-gray-600 italic">(Nothing selected.)</p>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </section>
</Pagination>

<style lang="postcss">
  .table-header {
    @apply bg-gray-100 text-gray-800 font-semibold p-4 flex justify-between items-center border-b-2;
  }
</style>
