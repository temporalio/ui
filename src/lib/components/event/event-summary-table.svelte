<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import EventCategoryFilter from '$lib/components/event/event-category-filter.svelte';
  import EventDateFilter from '$lib/components/event/event-date-filter.svelte';
  import { expandAllEvents } from '$lib/stores/event-view';

  export let compact = false;

  let title = compact ? 'Event Type' : 'Workflow Events';
  let expandAll = $expandAllEvents === 'true';

  const dispatch = createEventDispatcher();

  function handleChange(e: Event) {
    const { checked } = e.target as HTMLInputElement;
    expandAll = checked;
    dispatch('expandAll', {
      expanded: checked ? 'true' : 'false',
    });
  }
</script>

<section class="event-table" data-cy="event-summary-table">
  <div
    class="table-header-row xl:table-header-group"
    data-cy="event-summary-table-header-desktop"
  >
    <div class="hidden xl:table-row">
      <div class="table-header w-8 rounded-tl-md" />
      <div class="table-header w-1/4">
        {title}<EventCategoryFilter />
      </div>
      <div class="table-header">
        Date & Time
        {#if !compact}<EventDateFilter />{/if}
      </div>
      <div class="table-header relative w-1/2 rounded-tr-md">
        Event Details
        <div class="absolute right-4 top-3">
          <input
            class="mr-1"
            type="checkbox"
            name="expandAll"
            on:change={handleChange}
            checked={expandAll}
          />
          <label for="expandAll">Expand all</label>
        </div>
      </div>
    </div>
  </div>
  <div class="table-header-row-responsive rounded-t-md">
    <div class="table-header-responsive">{title}<EventCategoryFilter /></div>
    <div class="table-header-responsive">
      Date & Time
      {#if !compact}<EventDateFilter />{/if}
    </div>
    <div class="table-header-responsive">
      <div>
        <input
          type="checkbox"
          name="expandAll"
          on:change={handleChange}
          checked={expandAll}
        />
        <label for="expandAll">Expand all</label>
      </div>
    </div>
  </div>
  <div class="overflow-y-auto xl:table-row-group">
    <slot />
  </div>
</section>

<style lang="postcss">
  .event-table {
    @apply w-full table-fixed rounded-lg border-2 border-gray-900 xl:table;
  }

  .table-header-row {
    @apply bg-gray-900 px-3 text-gray-100;
  }

  .table-header-row-responsive {
    @apply flex justify-end bg-gray-900 px-3 text-gray-100 xl:hidden;
  }

  .table-header {
    @apply flex p-2 text-left xl:table-cell;
  }

  .table-header-responsive {
    @apply flex items-center p-2;
  }
</style>
