<script lang="ts">
  import { fly } from 'svelte/transition';

  import { getContext } from 'svelte';

  import {
    isBooleanFilter,
    isDateTimeFilter,
    isDurationFilter,
    isListFilter,
    isNumberFilter,
    isStatusFilter,
    isTextFilter,
  } from '$lib/utilities/query/search-attribute-filter';

  import { FILTER_CONTEXT, type FilterContext } from '../index.svelte';

  import AttributeList from './attribute-list.svelte';
  import BooleanFilter from './boolean-filter.svelte';
  import DatetimeFilter from './datetime-filter.svelte';
  import DurationFilter from './duration-filter.svelte';
  import ListFilter from './list-filter.svelte';
  import NumberFilter from './number-filter.svelte';
  import StatusFilter from './status-filter.svelte';
  import TextFilter from './text-filter.svelte';

  const { filter, resetFilter } = getContext<FilterContext>(FILTER_CONTEXT);

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Escape' && !isTextFilter($filter)) {
      resetFilter();
    }
  }
</script>

<div class="flex h-full w-full flex-row items-start overflow-y-auto">
  <AttributeList activeFilter={$filter} />
  <div class="sticky top-0 flex w-2/3 flex-col gap-4 py-4">
    <div class="relative" onkeyup={handleKeyUp} role="none">
      {#if isStatusFilter($filter)}
        <StatusFilter />
      {:else if $filter.attribute}
        <div
          class="flex flex-col gap-2 px-2"
          in:fly={{ x: -100, duration: 150 }}
        >
          {#if isTextFilter($filter)}
            <TextFilter />
          {:else if isListFilter($filter)}
            <ListFilter />
          {:else if isDurationFilter($filter)}
            <DurationFilter />
          {:else if isNumberFilter($filter)}
            <NumberFilter />
          {:else if isDateTimeFilter($filter)}
            <DatetimeFilter />
          {:else if isBooleanFilter($filter)}
            <BooleanFilter />
          {/if}
        </div>
      {:else}
        <p class="text-center text-secondary">
          Pick a Search Attribute to filter by
        </p>
      {/if}
    </div>
  </div>
</div>
