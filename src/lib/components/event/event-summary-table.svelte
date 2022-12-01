<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import {
    workflowEventsColumnWidth,
    workflowEventsResponsiveColumnWidth,
  } from '$lib/stores/column-width';
  import EventCategoryFilter from '$lib/components/event/event-category-filter.svelte';
  import EventDateFilter from '$lib/components/event/event-date-filter.svelte';
  import { expandAllEvents } from '$lib/stores/event-view';

  export let compact = false;
  export let typedError = false;

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

<section
  class="event-table"
  class:error-table={typedError}
  data-cy="event-summary-table"
>
  <div
    class="table-header-row xl:table-header-group"
    class:header-hidden={typedError}
    data-cy="event-summary-table-header-desktop"
  >
    <div class="hidden xl:table-row">
      <div class="table-header w-14 rounded-tl-md" />
      <div class="table-header w-80">
        Date & Time{#if !compact}<EventDateFilter />{/if}
      </div>
      <div
        bind:offsetWidth={$workflowEventsColumnWidth}
        class="table-header relative w-1/5"
      >
        {title}<EventCategoryFilter />
      </div>
      <div class="table-header w-auto" />
      <div class="table-header relative w-32 rounded-tr-md">
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
  <div
    class="table-header-row-responsive rounded-t-md"
    class:header-hidden-responsive={typedError}
  >
    <div class="table-header-responsive w-2/3">
      Date & Time
      {#if !compact}<EventDateFilter />{/if}
    </div>
    <div
      bind:offsetWidth={$workflowEventsResponsiveColumnWidth}
      class="table-header-responsive w-1/3 justify-end"
    >
      {title}<EventCategoryFilter />
    </div>
    <div class="table-header-responsive" />
    <div class="table-header-responsive min-w-fit">
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
    @apply flex justify-between bg-gray-900 px-3 text-gray-100 xl:hidden;
  }

  .table-header {
    @apply flex items-center px-3 py-1 text-left xl:table-cell;
  }

  .table-header-responsive {
    @apply flex items-center p-2;
  }

  .error-table {
    @apply table border border-yellow-700;
  }

  .header-hidden {
    visibility: collapse;
  }

  .header-hidden-responsive {
    @apply hidden;
  }
</style>
