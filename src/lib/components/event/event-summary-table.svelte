<script lang="ts">
  import EventCategoryMenu from '$lib/components/event/event-category-menu.svelte';
  export let compact = false;

  let title = compact ? 'Event Type' : 'Workflow Events';
</script>

<section class="event-table">
  <div class="table-header-row md:table-header-group">
    <div class="md:table-row hidden">
      <div class="table-header w-3/12 rounded-tl-md">
        {title}<EventCategoryMenu {compact} />
      </div>
      <div class="table-header w-3/12">Date & Time</div>
      <div class="table-header w-1/2 rounded-tr-md">Event Details</div>
    </div>
  </div>
  <div class="table-header-row md:hidden rounded-t-md">
    <div class="table-header">{title}<EventCategoryMenu {compact} /></div>
  </div>
  <div class="overflow-y-auto md:table-row-group">
    <slot />
  </div>
</section>

<style lang="postcss">
  .event-table {
    @apply md:table border-gray-900 border-2 rounded-lg w-full;
  }

  .table-header-row {
    @apply bg-gray-900 text-gray-100 px-3;
  }

  .table-header {
    @apply md:table-cell table-cell text-left px-3 py-3;
  }
</style>
