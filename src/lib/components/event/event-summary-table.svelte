<script lang="ts">
  import EventCategoryMenu from '$lib/components/event/event-category-menu.svelte';
</script>

<section class="summary-table">
  <div class="table-header-row md:table-header-group">
    <div class="md:table-row hidden">
      <div class="table-header w-3/12 rounded-tl-md">
        Workflow Events<EventCategoryMenu />
      </div>
      <div class="table-header w-3/12">Date & Time</div>
      <div class="table-header w-1/2 rounded-tr-md">Event Details</div>
    </div>
  </div>
  <div class="table-header-row md:hidden rounded-t-md">
    <div class="table-header">Summary<EventCategoryMenu /></div>
  </div>
  <div class="overflow-y-auto md:table-row-group">
    <slot />
  </div>
</section>

<style lang="postcss">
  .summary-table {
    @apply md:table border-gray-300 border-2 rounded-lg w-full max-w-full;
  }

  .table-header-row {
    @apply bg-gray-900 text-gray-100;
  }

  .table-header {
    @apply table-cell text-left p-3;
  }
</style>
