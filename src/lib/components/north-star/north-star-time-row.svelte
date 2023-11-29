<script lang="ts">
  import * as _ from 'lodash';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { EventTypeCategory } from '$lib/types/events';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { pluralize } from '$lib/utilities/pluralize';

  import NorthStarGroupRow from './north-star-group-row.svelte';

  export let date: string;
  export let group: EventGroup[];

  $: categorizedGroups = _.groupBy(group, (group) => group.category) as Record<
    EventTypeCategory,
    EventGroup[]
  >;

  let open = false;

  const getCategoryName = (category: string) => {
    if (category.includes('-')) {
      return category
        .split('-')
        .map((x) => capitalize(x))
        .join(' ');
    }
    return capitalize(category);
  };
</script>

<div class="flex items-start gap-2">
  <Icon class="mt-4" name="clock" />

  <div
    class="flex w-full flex-col gap-1 rounded-lg border-2 border-gray-900 bg-white px-3 py-2 pl-8"
  >
    <button on:click={() => (open = !open)}>
      <div class="flex w-full items-center gap-4">
        {formatDate(new Date(date), $timeFormat, {
          relative: $relativeTime,
        })}
        <div class="flex gap-2">
          {#each Object.entries(categorizedGroups) as [category, categoryGroup]}
            <div class="category {category}">
              <span class="rounded px-1 font-mono {category}-count"
                >{categoryGroup.length}</span
              >
              {pluralize(getCategoryName(category), categoryGroup.length)}
            </div>
          {/each}
        </div>
        <Icon name="chevron-{open ? 'up' : 'down'}" />
      </div>
    </button>
    {#if open}
      <div class="mt-2 flex flex-col">
        {#each Object.entries(categorizedGroups) as [category, categoryGroup], j}
          {#each categoryGroup as group, i}
            <NorthStarGroupRow
              {category}
              {group}
              index={i + j}
              last={j === Object.values(categorizedGroups).length - 1 &&
                i === categoryGroup.length - 1}
            />
          {/each}
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .category {
    @apply w-auto rounded-full border-2 px-2 py-1 text-sm;
  }

  .activity {
    @apply border-purple-700 bg-purple-200 text-purple-700;
  }

  .activity-count {
    @apply bg-purple-300;
  }

  .child-workflow {
    @apply border-green-700 bg-green-200 text-green-700;
  }

  .child-workflow-count {
    @apply bg-green-300;
  }

  .marker {
    @apply border-orange-700 bg-orange-200 text-orange-700;
  }

  .marker-count {
    @apply bg-orange-300;
  }

  .timer {
    @apply border-yellow-700 bg-yellow-200 text-yellow-700;
  }

  .timer-count {
    @apply bg-yellow-300;
  }

  .signal {
    @apply border-pink-700 bg-pink-200 text-pink-700;
  }

  .signal-count {
    @apply bg-pink-300;
  }
</style>
