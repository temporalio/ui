<script lang="ts">
  import EventCategoryFilter from '$lib/components/event/event-category-filter.svelte';
</script>

<section class="compact-table">
  <div class="table-header md:table-header-group">
    <div class="md:table-row hidden">
      <div class="table-header-cell w-3/12 rounded-tl-md">
        Event Type<EventCategoryFilter compact />
      </div>
      <div class="table-header-cell w-1/2 rounded-tr-md">Event Details</div>
    </div>
  </div>
  <div class="table-header md:hidden rounded-t-md">
    <div class="table-header-cell">Compact<EventCategoryFilter compact /></div>
  </div>
  <div class="overflow-y-auto md:table-row-group">
    <slot />
  </div>
</section>

<style lang="postcss">
  .compact-table {
    @apply md:table border-gray-300 border-2 rounded-lg w-full;
  }

  .table-header {
    @apply bg-gray-900 text-gray-100;
  }

  .table-header-cell {
    @apply table-cell text-left p-3;
  }
</style>
