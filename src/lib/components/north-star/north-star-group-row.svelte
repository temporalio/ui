<script lang="ts">
  import * as _ from 'lodash';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { EventTypeCategory } from '$lib/types/events';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { isActivityTaskScheduledEvent } from '$lib/utilities/is-event-type';

  import NorthStarGroupDetails from './north-star-group-details.svelte';

  export let group: EventGroup;
  export let category: EventTypeCategory;
  export let first: boolean;
  export let last: boolean;

  let open = false;

  const getCategoryName = (category: EventTypeCategory) => {
    if (category.includes('-')) {
      return category
        .split('-')
        .map((x) => capitalize(x))
        .join(' ');
    }
    return capitalize(category);
  };

  $: pendingActivity = $workflowRun?.workflow?.pendingActivities.find(
    (activity) =>
      group.eventList.find(
        (e) =>
          isActivityTaskScheduledEvent(e) &&
          e.attributes.activityId === activity.activityId,
      ),
  );

  $: duration = formatDistanceAbbreviated({
    start: group.initialEvent.eventTime,
    end: group.lastEvent.eventTime,
    includeMilliseconds: true,
  });
</script>

<button on:click={() => (open = !open)}>
  <div
    class="flex w-full items-center justify-between border-b-2 border-l-2 border-r-2 border-gray-900 bg-blueGray-100 px-3 py-2 pl-8"
    class:rounded-t-xl={first}
    class:rounded-b-xl={last && !open}
    class:border-t-2={first}
  >
    <div class="flex flex-col items-center gap-1 md:flex-row md:gap-4">
      <span class="font-mono">{group.id}</span>
      <p>
        {getCategoryName(category)}
      </p>
      <p class="category {category}">
        {capitalize(group.name)}
      </p>
      {#if pendingActivity}
        <div class="flex gap-2">
          <p class="badge badge-{group?.status}">
            {pendingActivity.state}
          </p>
          <p class="flex gap-1 rounded bg-red-200 px-1 text-red-700">
            <Icon name="retry" />Retry
          </p>
        </div>
      {:else}
        <p class="badge badge-{group?.status}">
          {group?.lastEvent?.classification || group?.status || ''}
        </p>
      {/if}
    </div>
    <div class="flex gap-2">
      {#if duration && duration !== '0ms'}
        <div class="flex flex-row items-center gap-0">
          <Icon class="inline" name="clock" />
          <p class="break-word truncate text-sm md:whitespace-normal">
            {duration}
          </p>
        </div>
      {/if}
      <Icon name="json" />
      <Icon name="chevron-{open ? 'up' : 'down'}" />
    </div>
  </div>
</button>
{#if open}
  <NorthStarGroupDetails {group} {pendingActivity} />
{/if}

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

  .badge {
    @apply rounded px-1;
  }

  .badge-Completed {
    @apply bg-green-200 text-green-900;
  }

  .badge-Scheduled,
  .badge-Initiated {
    @apply border border-gray-600 text-gray-600;
  }

  .badge-Started {
    @apply border border-blue-600 text-blue-600;
  }

  .badge-Failed {
    @apply bg-red-200 text-red-900;
  }

  .badge-Canceled {
    @apply bg-yellow-200 text-yellow-900;
  }
</style>
