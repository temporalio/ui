<script lang="ts">
  import { onMount } from 'svelte';
  import {
    type DataGroup,
    type DataItem,
    DataSet,
    Timeline,
  } from 'vis-timeline/standalone';

  import { page } from '$app/stores';

  import HeartBeat from '$lib/components/heart-beat-indicator.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { CATEGORIES } from '$lib/models/event-history/get-event-categorization';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import { eventCategoryFilter } from '$lib/stores/filters';
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
    const { label, category, id } = group;
    const { workflow, run, namespace } = $page.params;
    const groupName = capitalize(label || category);
    const href = routeForEventGroup({
      eventId: id,
      namespace,
      workflow,
      run,
    });

    const link = renderComponentToHTML(Link, {
      href,
      text: groupName,
      class: 'flex gap-2 items-center',
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
    return `<div class="flex gap-1 items-center"><div class="flex gap-1 items-center">${retryIcon}${attempt.toString()}</div><div class="bar-content"><p>${name}</p></div></div>`;
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
          id: `pending-${groupPendingActivity.activityId}`,
          group: `group-${index}`,
          start: initialEvent.eventTime,
          end: Date.now(),
          content: renderPendingAttempts(
            group.name,
            groupPendingActivity.attempt,
          ),
          className: `${lastEvent.category} ${lastEvent.classification}`,
          editable: false,
        });
      } else {
        items.add({
          id: `group-${index}-items`,
          group: `group-${index}`,
          start: initialEvent.eventTime,
          data: group,
          content:
            group.eventList.length === 1
              ? group.name
              : `<div class="bar-content">${group.name}${getIcon(
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
      getTimelineOptions($workflowRun.workflow, { maxHeight }),
    );
    filterAndSetItems($eventCategoryFilter);
  };

  const filterAndSetItems = (category: EventTypeCategory[]) => {
    const reverseHistory =
      $eventFilterSort === 'descending' && $eventViewType === 'feed';
    const sortedHistory = reverseHistory
      ? [...history].reverse()
      : [...history];
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
    history.length &&
    visualizationRef;

  const drawTimeline = () => {
    if (timeline) {
      timeline.destroy();
    }
    buildTimeline();
  };

  $: {
    if (readyToDraw) {
      drawTimeline();
    }
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center justify-end gap-2">
    <div class="flex gap-2 bg-white">
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
    font-family: Poppins, sans-serif;
    font-size: 12px;
    display: flex;
    align-items: center;
    color: #18181b;
  }

  :global(.vis-timeline) {
    border: none;
  }

  :global(.vis-time-axis .vis-text) {
    font-size: 10px;
    color: white !important;
  }

  :global(.vis-background, .vis-timeline) {
    background-color: #18181b;
    color: white;
    border-radius: 0.75rem;
    border-width: 2px;
    border: 2px solid #18181b;
  }

  :global(.vis-content, .vis-group) {
    background-color: white;
  }

  :global(.vis-timeline .vis-item) {
    background-color: #fff;
    border-color: transparent;
    color: #3f3f46;
    font-size: 12px;
  }

  :global(.vis-item.vis-dot) {
    background-color: #18181b;
  }

  :global(.vis-item-overflow) {
    overflow: visible !important;
  }

  :global(.vis-tooltip) {
    background-color: #18181b !important;
    color: white !important;
    border-radius: 0.75rem !important;
    border-width: 2px !important;
    border: 2px solid #18181b !important;
    height: auto !important;
    font-size: 0.5em !important;
  }

  :global(.vis-item.Card) {
    width: 100% !important;
  }

  /* CSS for each activity type block */
  :global(.vis-item.vis-range.workflow) {
    background-color: #f4f4f5;
    border-color: #18181b;
    border-radius: 9999px;
    border-width: 2px;
    color: #18181b;
  }

  :global(.vis-item.vis-point.workflow) {
    background-color: #18181b;
    color: #18181b;
  }

  /* CSS for each classifciation */
  :global(.vis-item.vis-range.Failed, .vis-item.vis-range.Terminated) {
    background-color: #fee2e2;
    border-color: #b91c1c;
    border-radius: 9999px;
    border-width: 2px;
    color: #b91c1c;
  }

  :global(.vis-item.vis-point.Failed, .vis-item.vis-range.Terminated) {
    color: #b91c1c;
  }

  :global(.vis-item.vis-range.TimedOut) {
    background-color: #ffedd5;
    border-color: #c2410c;
    border-radius: 9999px;
    border-width: 2px;
    color: #c2410c;
  }

  :global(.vis-item.vis-point.TimedOut) {
    color: #c2410c;
  }

  :global(
      .vis-item.vis-range.Canceled,
      .vis-item.vis-range.CanceledRequested,
      .vis-item.vis-range.Paused
    ) {
    background-color: #fef9c3;
    border-color: #a16207;
    border-radius: 9999px;
    border-width: 2px;
    color: #a16207;
  }

  :global(
      .vis-item.vis-point.Canceled,
      .vis-item.vis-point.CanceledRequested,
      .vis-item.vis-point.Paused
    ) {
    color: #a16207;
  }

  :global(
      .vis-item.vis-range.Running,
      .vis-item.vis-range.Fired,
      .vis-item.vis-range.Scheduled,
      .vis-item.vis-range.Started,
      .vis-item.vis-range.Initiated
    ) {
    background-color: #dbeafe;
    border-color: #1d4ed8;
    border-radius: 9999px;
    border-width: 2px;
    color: #1d4ed8;
  }

  :global(
      .vis-item.vis-point.Running,
      .vis-item.vis-point.Fired,
      .vis-item.vis-point.Scheduled,
      .vis-item.vis-point.Started,
      .vis-item.vis-point.Initiated
    ) {
    color: #1d4ed8;
  }

  :global(.vis-item.vis-range.workflow.Running) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  :global(.vis-item.vis-range.ContinuedAsNew) {
    background-color: #e4e4e7;
    border-color: #18181b;
    border-radius: 9999px;
    border-width: 2px;
    color: #17172c;
  }

  :global(.vis-item.vis-point.ContinuedAsNew) {
    color: #18181b;
  }

  :global(.vis-item.vis-range.Completed, .vis-item.vis-range.Open) {
    background-color: #dcfce7;
    border-color: #15803d;
    border-radius: 9999px;
    border-width: 2px;
    color: #15803d;
  }

  :global(.vis-item.vis-point.Completed, .vis-item.vis-point.Open) {
    color: #15803d;
  }

  :global(.vis-item.vis-range.New) {
    background-color: #e0eaff;
    border-color: #4338ca;
    border-radius: 9999px;
    border-width: 2px;
    color: #4338ca;
  }

  :global(.vis-item.vis-point.New) {
    color: #4338ca;
  }

  :global(.vis-item.vis-range.Signaled) {
    background-color: #f3e8ff;
    border-color: #7e22ce;
    border-radius: 9999px;
    border-width: 2px;
    color: #7e22ce;
  }

  :global(.vis-item.vis-point.Signaled) {
    color: #7e22ce;
  }

  /* CSS for each activity type */
  :global(.vis-item.vis-dot.marker) {
    border-color: #18181b;
  }

  :global(.vis-item.vis-range.signal) {
    color: #652b19;
  }

  :global(.vis-item.vis-point.signal) {
    color: #652b19;
  }

  :global(.vis-item.vis-range.update) {
    background-color: #f3e8ff;
    border-color: #581c87;
    border-radius: 9999px;
    border-width: 2px;
    color: #581c87;
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
