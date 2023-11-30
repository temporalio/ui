<script lang="ts">
  import * as _ from 'lodash';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Spinner from '$lib/holocene/icon/svg/spinner.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { CATEGORIES } from '$lib/models/event-history/get-event-categorization';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { eventCategoryFilter, eventStatusFilter } from '$lib/stores/filters';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
    CommonHistoryEvent,
    EventTypeCategory,
  } from '$lib/types/events';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { pluralize } from '$lib/utilities/pluralize';

  import NorthStarInputAndResult from './north-star-input-and-result.svelte';

  $: ({ workflow } = $workflowRun);

  const getEventGroups = (
    items: CommonHistoryEvent[],
    category: string,
    status: string,
  ): EventGroup[] => {
    let filteredItems = [...items];
    if (category) {
      filteredItems = filteredItems.filter((i) => {
        if (category === CATEGORIES.LOCAL_ACTIVITY) {
          return isLocalActivityMarkerEvent(i);
        }
        return i.category === category;
      });
    }

    const groups = groupEvents(filteredItems, $eventFilterSort);
    if (status) {
      return groups.filter((group) => {
        return group.status === status;
      });
    }
    return groups;
  };

  $: category = $eventCategoryFilter as EventTypeCategory;
  $: status = $eventStatusFilter;
  $: currentEvents = $fullEventHistory.length
    ? $fullEventHistory
    : $eventHistory?.start;
  $: items = getEventGroups(currentEvents, category, status);
  $: categoryItems = _.groupBy(items, (x) => x.category);
  $: elapsedTime = formatDistanceAbbreviated({
    start: workflow?.startTime,
    end: workflow?.endTime,
    includeMillisecondsForUnderSecond: true,
    includeMilliseconds: true,
  });
  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($eventHistory);

  let inputInline = true;
  let resultInline = true;

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

<div class="flex w-full flex-col gap-2">
  <h1 class="text-xl">Summary</h1>
  <div class="border-l-8 border-gray-900">
    <div class="flex flex-col gap-2">
      <div class="flex items-center items-stretch gap-0">
        <p
          class="py-auto flex w-20 flex-col justify-center bg-gray-900 font-mono text-white"
        >
          Input
        </p>
        <NorthStarInputAndResult
          inline={inputInline}
          content={workflowEvents.input}
          data-testid="workflow-input"
        />
        <button
          on:click={() => (inputInline = !inputInline)}
          class="py-auto flex flex-col justify-center rounded-r-lg bg-gray-900 px-2.5 font-mono text-white"
        >
          <Icon name={inputInline ? 'chevron-down' : 'chevron-up'} />
        </button>
      </div>

      <div class="flex flex-col gap-2 px-4 py-2">
        <div class="flex flex-row gap-2">
          <div
            class="flex flex-col items-start gap-2 rounded border-2 border-gray-900 bg-white px-4 py-2"
          >
            <p class="flex gap-2">
              <strong>Run ID</strong>
              {workflow.runId}
            </p>
            <p class="flex gap-2">
              <strong>Task Queue</strong>
              {workflow.taskQueue}
            </p>
            <p class="flex gap-2">
              <strong>{translate('workflows.state-transitions')}</strong>
              {workflow?.stateTransitionCount}
            </p>
          </div>
          <div
            class="flex flex-col items-start gap-2 rounded border-2 border-gray-900 bg-white px-4 py-2"
          >
            <p class="flex gap-2">
              <strong>START</strong>
              {formatDate(workflow?.startTime, $timeFormat, {
                relative: $relativeTime,
              })}
            </p>
            <p class="flex gap-2">
              <strong>END</strong>
              {#if workflow?.endTime}
                {formatDate(workflow?.endTime, $timeFormat, {
                  relative: $relativeTime,
                })}
              {:else}
                <Spinner class="h-6 w-6 animate-spin" />
              {/if}
            </p>
            {#if elapsedTime}
              <div class="flex flex-row items-center justify-end">
                <Icon class="min-w-fit" name="clock" />
                <p class="truncate text-sm">
                  {elapsedTime}
                </p>
              </div>
            {/if}
          </div>
          <div
            class="flex items-center gap-2 rounded border-2 border-gray-900 bg-white px-4 py-2"
          >
            {#each Object.entries(categoryItems) as [category, group]}
              <div class="category {category}">
                <span class="rounded px-1 font-mono {category}-count"
                  >{group.length}</span
                >
                {pluralize(getCategoryName(category), group.length)}
              </div>
              {#each Object.entries(_.groupBy(group, (x) => x.status)) as [status, statusGroup]}
                {#if status !== 'undefined'}
                  <div class="status status-{status}">
                    <span class="font-mono">{statusGroup.length}</span>
                    {status}
                  </div>
                {/if}
              {/each}
            {/each}
          </div>
        </div>
      </div>
      <div class="flex items-center items-stretch gap-0">
        <p
          class="py-auto flex {workflowEvents.results
            ? 'w-20'
            : 'w-auto'} flex-col justify-center bg-gray-900 text-center font-mono text-white"
        >
          {#if workflowEvents.results}
            Results
          {:else}
            <Spinner class="h-6 w-6 animate-spin" />
          {/if}
        </p>
        <NorthStarInputAndResult
          inline={resultInline}
          content={workflowEvents.results}
          data-testid="workflow-results"
        />
        <button
          on:click={() => (resultInline = !resultInline)}
          class="py-auto flex flex-col justify-center rounded-r-lg bg-gray-900 px-2.5 font-mono text-white"
        >
          <Icon name={resultInline ? 'chevron-down' : 'chevron-up'} />
        </button>
      </div>
    </div>
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
