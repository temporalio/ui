<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import EventCategoryFilter from '$lib/components/event/event-category-filter.svelte';
  import EventDateFilter from '$lib/components/event/event-date-filter.svelte';
  import { expandAllEvents } from '$lib/stores/event-views';

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
    <div class="xl:table-row hidden">
      <div class="table-header w-8 rounded-tl-md" />
      <div class="table-header w-1/4">
        {title}<EventCategoryFilter />
      </div>
      <div class="table-header">
        Date & Time
        {#if !compact}<EventDateFilter />{/if}
      </div>
      <div class="table-header rounded-tr-md w-1/2 relative">
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
    @apply xl:table table-fixed border-gray-900 border-2 rounded-lg w-full;
  }

  .table-header-row {
    @apply bg-gray-900 text-gray-100 px-3;
  }

  .table-header-row-responsive {
    @apply flex xl:hidden bg-gray-900 text-gray-100 px-3 justify-end;
  }

  .table-header {
    @apply xl:table-cell text-left p-2 flex;
  }

  .table-header-responsive {
    @apply p-2 flex items-center;
  }
</style>
