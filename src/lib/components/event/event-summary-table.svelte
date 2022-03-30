<script lang="ts">
  import { page } from '$app/stores';

  import FilterSelect from '$lib/components/select/filter-select.svelte';

  import Option from '$lib/components/select/option.svelte';

  let category = $page.params.category;
</script>


<section class="summary-table">
  <div class="table-header md:table-header-group">
    <div class="md:table-row hidden">
      <div class="table-header-cell w-3/12 rounded-tl-lg">Workflow Events
        <div class="flex items-center gap-4">
          <FilterSelect parameter="category" bind:value={category}>
            <Option value={undefined}>All</Option>
            <Option value="activity">Activity</Option>
            <Option value="command">Command</Option>
            <Option value="signal">Signal</Option>
            <Option value="timer">Timer</Option>
            <Option value="child-workflow">Child Workflow</Option>
            <Option value="workflow">Workflow</Option>
          </FilterSelect>
        </div>    
      </div>
      <div class="table-header-cell w-3/12">Date & Time</div>
      <div class="table-header-cell w-1/2 rounded-tr-lg">Event Details</div>
    </div>
  </div>
  <div class="table-header md:hidden rounded-t-lg">
    <div class="table-header-cell">Summary</div>
  </div>
  <div class="overflow-y-auto md:table-row-group">
    <slot />
  </div>
</section>

<style lang="postcss">
  .summary-table {
    @apply md:table border-gray-300 border-2 rounded-t-xl w-full mb-24;
  }

  .table-header {
    @apply bg-gray-900 text-gray-100;
  }

  .table-header-cell {
    @apply table-cell text-left p-3;
  }
</style>
