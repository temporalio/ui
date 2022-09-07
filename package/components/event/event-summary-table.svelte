<script>import { createEventDispatcher } from 'svelte';
import { workflowEventsColumnWidth, workflowEventsResponsiveColumnWidth, } from '../../stores/column-width';
import EventCategoryFilter from './event-category-filter.svelte';
import EventDateFilter from './event-date-filter.svelte';
import { expandAllEvents } from '../../stores/event-view';
export let compact = false;
let title = compact ? 'Event Type' : 'Workflow Events';
let expandAll = $expandAllEvents === 'true';
const dispatch = createEventDispatcher();
function handleChange(e) {
    const { checked } = e.target;
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
      <div class="table-header w-12 rounded-tl-md" />
      <div class="table-header w-80">
        Date & Time
        {#if !compact}<EventDateFilter />{/if}
      </div>
      <div
        bind:offsetWidth={$workflowEventsColumnWidth}
        class="table-header relative w-1/5"
      >
        {title}<EventCategoryFilter />
      </div>
      <div class="table-header w-auto" />
      <div class="table-header relative w-32 rounded-tr-md">
        <div class="absolute right-5 top-3">
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

<style>
  .event-table {

    width: 100%;

    table-layout: fixed;

    border-radius: 0.5rem;

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(24 24 27 / var(--tw-border-opacity))
}

@media (min-width: 1280px) {

    .event-table {

        display: table
    }
}

  .table-header-row {

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    padding-left: 0.75rem;

    padding-right: 0.75rem;

    --tw-text-opacity: 1;

    color: rgb(244 244 245 / var(--tw-text-opacity))
}

  .table-header-row-responsive {

    display: flex;

    justify-content: space-between;

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    padding-left: 0.75rem;

    padding-right: 0.75rem;

    --tw-text-opacity: 1;

    color: rgb(244 244 245 / var(--tw-text-opacity))
}

  @media (min-width: 1280px) {

    .table-header-row-responsive {

        display: none
    }
}

  .table-header {

    display: flex;

    padding-left: 0.75rem;

    padding-right: 0.75rem;

    padding-top: 0.5rem;

    padding-bottom: 0.5rem;

    text-align: left
}

  @media (min-width: 1280px) {

    .table-header {

        display: table-cell
    }
}

  .table-header-responsive {

    display: flex;

    align-items: center;

    padding: 0.5rem
}</style>
