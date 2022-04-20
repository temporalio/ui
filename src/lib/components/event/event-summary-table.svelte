<script lang="ts">
  export let compact = false;

  import EventCategoryFilter from '$lib/components/event/event-category-filter.svelte';
  import EventDateFilter from '$lib/components/event/event-date-filter.svelte';

  let title = compact ? 'Event Type' : 'Workflow Events';
</script>

<section class="event-table">
  <div class="table-header-row xl:table-header-group">
    <div class="xl:table-row hidden">
      <div class="table-header w-96 rounded-tl-md">
        {title}<EventCategoryFilter />
      </div>
      <div class="table-header w-60">
        Date & Time
        {#if !compact}<EventDateFilter />{/if}
      </div>
      <div class="table-header rounded-tr-md">Event Details</div>
    </div>
  </div>
  <div class="table-header-row-responsive rounded-t-md">
    <div class="table-header text-right">{title}<EventCategoryFilter /></div>
    <div class="table-header text-right">
      Date & Time
      {#if !compact}<EventDateFilter />{/if}
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
    @apply xl:table-cell text-left px-3 py-3;
  }
</style>
