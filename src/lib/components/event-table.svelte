<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list';

  import type { Activities } from '$lib/models/activity';
  import Event from './event.svelte';

  export let events: (HistoryEventWithId | PendingActivity)[] | Activities;
</script>

<section
  class="flex flex-col border-2 border-gray-300 rounded-lg w-full event-history"
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
        <VirtualList items={events} let:item>
          <Event event={item} />
        </VirtualList>
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

<style lang="postcss">
  .event-history {
    height: calc(100vh - 360px);
  }

  .table-header {
    @apply bg-gray-100 text-gray-800 font-semibold p-4 border-b-2 flex justify-between items-center;
  }
</style>
