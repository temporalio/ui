<script lang="ts">
  import sanitizeHtml from 'sanitize-html';
  import { onMount } from 'svelte';
  import {
    type DataGroup,
    type DataItem,
    DataSet,
    Timeline,
  } from 'vis-timeline/standalone';

  import { page } from '$app/stores';

  import HeartBeat from '$lib/components/heart-beat-indicator.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { CATEGORIES } from '$lib/models/event-history/get-event-categorization';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { getUTCOffset, timeFormat } from '$lib/stores/time-format';
  import {
    workflowRun,
    workflowTimelineViewOpen,
  } from '$lib/stores/workflow-run';
  import type {
    CommonHistoryEvent,
    EventClassification,
    EventTypeCategory,
  } from '$lib/types/events';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { getSummaryAttribute } from '$lib/utilities/get-single-attribute-for-event';
  import {
    isActivityTaskScheduledEvent,
    isLocalActivityMarkerEvent,
  } from '$lib/utilities/is-event-type';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { routeForEventGroup } from '$lib/utilities/route-for';

  import { getTimelineOptions } from './event-history-timeline-helpers';

  export let history: CommonHistoryEvent[] = [];
  export let maxHeight = 520;

  let visualizationRef;
  let timeline;

  function renderComponentToHTML(Component, props) {
    const container = document.createElement('div');
    new Component({ target: container, props });
    return container.innerHTML;
  }

  function renderGroupName(group) {
    const { label, category, name, id } = group;
    const { workflow, run, namespace } = $page.params;
    const isLocalActivity = isLocalActivityMarkerEvent(group.initialEvent);
    const groupName = capitalize(isLocalActivity ? name : label || category);
    const href = routeForEventGroup({
      eventId: id,
      namespace,
      workflow,
      run,
    });

    const link = renderComponentToHTML(Link, {
      href,
      text: sanitizeHtml(groupName),
      class: 'flex gap-2 items-center !text-space-black',
    });
    return link;
  }

  function renderExecutionName() {
    return '<div class="flex gap-1 items-center">Workflow Execution</div>';
  }

  function renderPendingAttempts(name, attempt) {
    const retryIcon = renderComponentToHTML(Icon, {
      name: 'retry',
    });
    return `<div class="flex gap-1 items-center"><div class="flex gap-1 items-center">${retryIcon}${attempt.toString()}</div><div class="bar-content"><p>${sanitizeHtml(
      name,
    )}</p></div></div>`;
  }

  function getIconName(classification: EventClassification): IconName | null {
    switch (classification) {
      case 'Completed':
        return 'checkmark';
      case 'Canceled':
      case 'Terminated':
        return 'canceled';
      case 'Failed':
        return 'error';
      case 'TimedOut':
        return 'clock';
      // TODO: Add icons for these
      // case 'Fired':
      // case 'CancelRequested':
      // case 'Signaled':
      // case 'Scheduled':
      // case 'Open':
      // case 'New':
      // case 'Started':
      // case 'Initiated':
      default:
        return null;
    }
  }

  function getIcon(classification: EventClassification): string {
    if (classification === 'Running') {
      return renderComponentToHTML(HeartBeat, {});
    }
    const name = getIconName(classification);
    return name
      ? renderComponentToHTML(Icon, {
          name,
        })
      : '';
  }

  type GroupItems = {
    items: DataSet<DataItem>;
    groups: DataSet<DataGroup>;
  };

  const createGroupItems = (
    eventGroups: EventGroups,
    isRunning: boolean,
    sortedHistory: CommonHistoryEvent[],
  ): GroupItems => {
    const items = new DataSet([]);
    const groups = new DataSet([]);
    const firstEvent = sortedHistory[0];
    const finalEvent = sortedHistory[sortedHistory.length - 1];

    if (!$eventCategoryFilter) {
      groups.add({
        id: 'workflow',
        content: renderExecutionName(),
        order: -1,
      });
      items.add({
        id: 'workflow',
        group: 'workflow',
        start: firstEvent.eventTime,
        end: isRunning ? Date.now() : finalEvent.eventTime,
        type: 'range',
        title: stringifyWithBigInt(
          {
            startTime: $workflowRun.workflow.startTime,
            endTime: $workflowRun.workflow?.endTime || Date.now(),
          },
          undefined,
          2,
        ),
        content: `<div class="bar-content">${
          $workflowRun.workflow.runId
        }${getIcon(isRunning ? 'Running' : finalEvent.classification)}</div>`,
        className: isRunning
          ? `${finalEvent.category} Running`
          : `${finalEvent.category} ${finalEvent.classification}`,
        editable: false,
      });
    }

    eventGroups.forEach((group, index) => {
      const initialEvent = group.initialEvent;
      const lastEvent = group?.lastEvent;
      const groupPendingActivity =
        $workflowRun?.workflow?.pendingActivities.find((activity) =>
          group.eventList.find(
            (e) =>
              isActivityTaskScheduledEvent(e) &&
              e.attributes.activityId === activity.activityId,
          ),
        );
      if (groupPendingActivity && isRunning) {
        items.add({
          id: `pending-${groupPendingActivity.activityId}-${index}`,
          group: `group-${index}`,
          start: initialEvent.eventTime,
          end: Date.now(),
          content: renderPendingAttempts(
            sanitizeHtml(group.name),
            groupPendingActivity.attempt,
          ),
          className: `${lastEvent.category} ${lastEvent.classification}`,
          editable: false,
        });
      } else {
        const singleEventName = isLocalActivityMarkerEvent(group.initialEvent)
          ? getSummaryAttribute(group.initialEvent)?.value ?? group.name
          : group.name;
        items.add({
          id: `group-${index}-items`,
          group: `group-${index}`,
          start: initialEvent.eventTime,
          data: group,
          content:
            group.eventList.length === 1
              ? sanitizeHtml(String(singleEventName))
              : `<div class="bar-content">${sanitizeHtml(group.name)}${getIcon(
                  lastEvent.classification,
                )}</div>`,
          end: lastEvent.eventTime,
          type: group.eventList.length === 1 ? 'point' : 'range',
          className: `${lastEvent.category} ${lastEvent.classification}`,
          editable: false,
        });
      }

      groups.add({
        id: `group-${index}`,
        content: renderGroupName(group),
        order: index,
      });
    });
    return { items, groups };
  };

  const setVizItems = (
    items: DataSet<unknown, 'id'>,
    groups: DataSet<unknown, 'id'>,
  ): void => {
    timeline.setGroups(groups);
    timeline.setItems(items);
    timeline.fit();
  };

  const filterHistory = (
    history: CommonHistoryEvent[],
    category: EventTypeCategory[],
  ): CommonHistoryEvent[] => {
    if (!category) return history;
    return history.filter((i) => {
      if (isLocalActivityMarkerEvent(i)) {
        return category.includes(CATEGORIES.LOCAL_ACTIVITY);
      }
      return category.includes(i.category);
    });
  };

  const buildTimeline = (): void => {
    timeline = new Timeline(
      visualizationRef,
      new DataSet([]),
      new DataSet([]),
      getTimelineOptions($workflowRun.workflow, {
        maxHeight,
        offset: getUTCOffset($timeFormat),
      }),
    );
    filterAndSetItems($eventCategoryFilter);
  };

  const filterAndSetItems = (category: EventTypeCategory[]) => {
    const sortedHistory =
      $eventFilterSort === 'descending' ? [...history].reverse() : [...history];
    const filteredHistory = filterHistory(sortedHistory, category);
    const eventGroups = groupEvents(filteredHistory);
    const { groups, items } = createGroupItems(
      eventGroups,
      $workflowRun?.workflow?.isRunning,
      sortedHistory,
    );
    setVizItems(items, groups);
  };

  onMount(() => {
    return () => timeline?.destroy();
  });

  $: readyToDraw =
    $workflowTimelineViewOpen &&
    $workflowRun.workflow &&
    visualizationRef &&
    $timeFormat;

  const drawTimeline = () => {
    if (timeline) {
      timeline.destroy();
    }
    buildTimeline();
  };

  $: {
    if (readyToDraw && history.length) {
      drawTimeline();
    }
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center justify-end gap-2">
    <div class="surface-primary flex gap-2">
      <ToggleButtons>
        <ToggleButton data-testid="zoom-in" on:click={() => timeline?.zoomIn(1)}
          >+</ToggleButton
        >
        <ToggleButton
          data-testid="zoom-in"
          on:click={() => timeline?.zoomOut(1)}>-</ToggleButton
        >
        <ToggleButton
          data-testid="zoom-in"
          on:click={() => timeline?.focus('workflow')}>Fit</ToggleButton
        >
      </ToggleButtons>
    </div>
  </div>
  <div class="timeline" bind:this={visualizationRef}>
    {#if !timeline}
      <Loading title="Building Timeline..." />
    {/if}
  </div>
</div>

<style lang="postcss">
  :global(.vis-item-content) {
    width: 100%;
  }

  :global(.vis-item .vis-range .vis-readonly, .vis-item .vis-item-overflow) {
    overflow: visible;
  }

  :global(.vis-label) {
    font-family: Inter, sans-serif;
    font-size: 12px;
    display: flex;
    align-items: center;

    @apply !text-space-black;
  }

  :global(.vis-timeline) {
    border: none;
  }

  :global(.vis-time-axis .vis-text) {
    font-size: 10px;
    color: theme(colors.white) !important;
  }

  :global(.vis-background, .vis-timeline) {
    background-color: theme(colors.black);
    color: theme(colors.white);
    border-radius: 0.75rem;
    border-width: 2px;
    border: 2px solid theme(colors.black);
  }

  :global(.vis-content, .vis-group) {
    @apply bg-off-white;
  }

  :global(.vis-timeline .vis-item) {
    border-color: transparent;
    font-size: 12px;
  }

  :global(.vis-item.vis-dot) {
    background-color: theme(colors.off-black);
  }

  :global(.vis-item-overflow) {
    overflow: visible !important;
  }

  :global(.vis-tooltip) {
    background-color: theme(colors.off-black) !important;
    color: white !important;
    border-radius: 0.75rem !important;
    border-width: 2px !important;
    border: 2px solid theme(colors.off-black) !important;
    height: auto !important;
    font-size: 0.5em !important;
  }

  :global(.vis-item.Card) {
    width: 100% !important;
  }

  /* CSS for each activity type block */
  :global(.vis-item.vis-range.workflow) {
    background-color: theme(colors.off-white);
    border-color: theme(colors.off-black);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.workflow) {
    background-color: theme(colors.off-black);
    color: theme(colors.off-black);
  }

  /* CSS for each classifciation */
  :global(.vis-item.vis-range.Failed) {
    background-color: theme(colors.red.300);
    border-color: theme(colors.red.300);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.Failed) {
    color: theme(colors.red.300);
  }

  :global(.vis-item.vis-range.Terminated, .vis-item.vis-range.CancelRequested) {
    background-color: theme(colors.yellow.300);
    border-color: theme(colors.yellow.300);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.Terminated, .vis-item.vis-point.CancelRequested) {
    color: theme(colors.yellow.300);
  }

  :global(.vis-item.vis-range.TimedOut) {
    background-color: theme(colors.orange.300);
    border-color: theme(colors.orange.300);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.TimedOut) {
    color: theme(colors.orange.300);
  }

  :global(.vis-item.vis-range.Canceled, .vis-item.vis-range.Unspecified) {
    background-color: theme(colors.slate.100);
    border-color: theme(colors.slate.100);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.Canceled, .vis-item.vis-point.Unspecified) {
    color: theme(colors.slate.100);
  }

  :global(.vis-item.vis-range.Fired) {
    background-color: theme(colors.pink.300);
    border-color: theme(colors.pink.300);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.Fired) {
    color: theme(colors.pink.300);
  }

  :global(.vis-item.vis-range.Scheduled) {
    background-color: theme(colors.indigo.300);
    border-color: theme(colors.indigo.300);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.Scheduled) {
    color: theme(colors.indigo.300);
  }

  :global(
      .vis-item.vis-range.Running,
      .vis-item.vis-range.New,
      .vis-item.vis-range.Started,
      .vis-item.vis-range.Initiated
    ) {
    background-color: theme(colors.blue.300);
    border-color: theme(colors.blue.300);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(
      .vis-item.vis-point.Running,
      .vis-item.vis-point.New,
      .vis-item.vis-point.Started,
      .vis-item.vis-point.Initiated
    ) {
    color: theme(colors.blue.300);
  }

  :global(.vis-item.vis-range.workflow.Running) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  :global(.vis-item.vis-range.ContinuedAsNew) {
    background-color: theme(colors.purple.300);
    border-color: theme(colors.purple.300);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.ContinuedAsNew) {
    color: theme(colors.purple.300);
  }

  :global(.vis-item.vis-range.Completed, .vis-item.vis-range.Open) {
    background-color: theme(colors.green.300);
    border-color: theme(colors.green.300);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.Completed, .vis-item.vis-point.Open) {
    color: theme(colors.green.300);
  }

  :global(.vis-item.vis-range.Signaled) {
    background-color: theme(colors.pink.200);
    border-color: theme(colors.pink.200);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.Signaled) {
    color: theme(colors.pink.200);
  }

  :global(.vis-item.vis-range.Paused) {
    background-color: theme(colors.yellow.200);
    border-color: theme(colors.yellow.200);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.space-black);
  }

  :global(.vis-item.vis-point.Paused) {
    color: theme(colors.yellow.200);
  }

  /* CSS for each activity type */
  :global(.vis-item.vis-dot.marker) {
    border-color: theme(colors.off-black);
  }

  :global(.vis-item.vis-range.signal) {
    color: theme(colors.orange.900);
  }

  :global(.vis-item.vis-point.signal) {
    color: theme(colors.orange.900);
  }

  :global(.vis-item.vis-range.update) {
    background-color: theme(colors.purple.100);
    border-color: theme(colors.purple.900);
    border-radius: 9999px;
    border-width: 2px;
    color: theme(colors.purple.900);
  }

  :global(.bar-content) {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  :global(.vis-item.vis-selected) {
    /* custom colors for selected orange items */
    background-color: transparent;
    border-color: transparent;
  }

  :global(.vis-item.vis-selected, .vis-item.vis-point.vis-selected) {
    background-color: transparent;
    border-color: transparent;
  }

  :global(.vis-group-level-unknown-but-gte1) {
    border: none;
  }
</style>
