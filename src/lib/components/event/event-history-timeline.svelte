<script lang="ts">
  import { onMount } from 'svelte';
  import {
    DataSet,
    Timeline,
    type TimelineOptionsZoomKey,
  } from 'vis-timeline/standalone';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { CATEGORIES } from '$lib/models/event-history/get-event-categorization';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { timeline } from '$lib/stores/timeline';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
    CommonHistoryEvent,
    EventTypeCategory,
  } from '$lib/types/events';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  import { tooltipTemplate } from './event-history-timeline-helpers';

  export let history: CommonHistoryEvent[] = [];

  let visualizationRef;

  $: category = $eventCategoryFilter as EventTypeCategory;

  function renderComponentToHTML(Component, props) {
    const container = document.createElement('div');
    new Component({ target: container, props });
    return container.innerHTML;
  }
  function renderGroupName(group) {
    const groupName = capitalize(group.category);
    return `<div class="flex gap-2 items-center">${groupName}</div>`;
  }
  function renderExecutionName() {
    return `<div class="flex gap-1 items-center">Workflow Execution</div>`;
  }
  function renderPendingAttempts(name, attempt) {
    const retryIcon = renderComponentToHTML(Icon, {
      name: 'retry',
    });
    return `<div class="flex gap-1 items-center"><div class="flex gap-1 items-center">${retryIcon}${attempt.toString()}</div><div class="bar-content"><p>${name}</p></div></div>`;
  }
  const createGroupItems = (eventGroups, isRunning, sortedHistory) => {
    const items = new DataSet([]);
    const groups = new DataSet([]);
    const firstEvent = sortedHistory[0];
    const finalEvent = sortedHistory[sortedHistory.length - 1];

    if (!category) {
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
        content: $workflowRun.workflow.runId,
        className: isRunning
          ? `${finalEvent.category} Running`
          : `${finalEvent.category} ${finalEvent.classification}`,
        editable: false,
      });
    }

    if (category && !eventGroups.length) {
      groups.add({
        id: 'no-results',
        content: translate('events', 'empty-state-title'),
        order: -1,
      });
    }

    eventGroups.forEach((group, i) => {
      const initialEvent = group.initialEvent;
      const lastEvent = group?.lastEvent;
      const groupPendingActivity =
        $workflowRun?.workflow?.pendingActivities.find((activity) =>
          group.eventList.find((e) => e.id === activity.activityId),
        );
      if (groupPendingActivity && isRunning) {
        items.add({
          id: `pending-${groupPendingActivity.activityId}`,
          group: group.id,
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
          id: `event-range-${initialEvent.id}`,
          group: group.id,
          start: initialEvent.eventTime,
          data: group,
          content:
            group.eventList.length === 1
              ? group.name
              : `<div class="bar-content">${group.name}</div>`,
          end: lastEvent.eventTime,
          type: group.eventList.length === 1 ? 'point' : 'range',
          className: `${lastEvent.category} ${lastEvent.classification}`,
          editable: false,
        });
      }
      groups.add({
        id: group.id,
        content: renderGroupName(group),
        order: i,
      });
    });
    return { items, groups };
  };

  type TimelineOptionsTooltipOverflow = 'flip' | 'none' | 'cap';

  const getOptions = () => ({
    stackSubgroups: true,
    maxHeight: 360,
    min: $workflowRun.workflow.startTime,
    max: $workflowRun.workflow?.endTime || Date.now(),
    horizontalScroll: true,
    verticalScroll: true,
    zoomKey: 'ctrlKey' as TimelineOptionsZoomKey,
    orientation: {
      axis: 'top',
      item: 'center',
    },
    tooltip: {
      delay: 0,
      overflowMethod: 'flip' as TimelineOptionsTooltipOverflow,
      followMouse: false,
      template: tooltipTemplate,
    },
    showMinorLabels: false,
    // format: {
    //   majorLabels: {
    //     millisecond: 'D MMMM HH:mm:ss',
    //     second: 'D MMMM HH:mm',
    //     minute: 'ddd D MMMM',
    //     hour: 'ddd D MMMM',
    //     weekday: 'MMMM YYYY',
    //     day: 'MMMM YYYY',
    //     week: 'MMMM YYYY',
    //     month: 'YYYY',
    //     year: '',
    //   },
    // },
    xss: {
      disabled: true,
      filterOptions: {
        whiteList: {
          div: ['class'],
        },
      },
    },
  });

  const setVizItems = (items, groups) => {
    $timeline.setGroups(groups);
    $timeline.setItems(items);
    $timeline.fit();
  };

  const filterHistory = (history, category) => {
    if (!category) return history;
    return history.filter((i) => {
      if (category === CATEGORIES.LOCAL_ACTIVITY) {
        return isLocalActivityMarkerEvent(i);
      }
      return i.category === category;
    });
  };

  const buildTimeline = (category: EventTypeCategory) => {
    $timeline = new Timeline(
      visualizationRef,
      new DataSet([]),
      new DataSet([]),
      getOptions(),
    );
    const reverseHistory =
      $eventFilterSort === 'descending' && $eventViewType !== 'compact';
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
    return () => {
      if ($timeline?.body) $timeline.destroy();
    };
  });

  $: {
    if ($workflowRun.workflow && history.length && visualizationRef) {
      if ($timeline?.body) {
        $timeline.destroy();
      }
      buildTimeline(category);
    }
  }
</script>

<div class="timeline" bind:this={visualizationRef} />

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
    color: #666c7b !important;
  }

  :global(.vis-background, .vis-timeline) {
    background-color: #e2e8f0;
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
    font-size: 0.75em !important;
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
  :global(.vis-item.vis-range.Failed) {
    background-color: #fee2e2;
    border-color: #b91c1c;
    border-radius: 9999px;
    border-width: 2px;
    color: #b91c1c;
  }

  :global(.vis-item.vis-point.Failed) {
    background-color: #b91c1c;
    color: #b91c1c;
  }

  :global(.vis-item.vis-range.TimedOut) {
    background-color: #ffedd5;
    border-color: #7c2d12;
    border-radius: 9999px;
    border-width: 2px;
    color: #7c2d12;
  }

  :global(.vis-item.vis-point.TimedOut) {
    background-color: #7c2d12;
    color: #7c2d12;
  }

  :global(.vis-item.vis-range.Canceled, .vis-item.vis-range.Paused) {
    background-color: #fef9c3;
    border-color: #713f12;
    border-radius: 9999px;
    border-width: 2px;
    color: #713f12;
  }

  :global(.vis-item.vis-point.Canceled, .vis-item.vis-point.Paused) {
    background-color: #713f12;
    color: #713f12;
  }

  :global(.vis-item.vis-range.Terminated, .vis-item.vis-range.Fired) {
    background-color: #e4e4e7;
    border-color: #18181b;
    border-radius: 9999px;
    border-width: 2px;
    color: #18181b;
  }

  :global(.vis-item.vis-point.Terminated, .vis-item.vis-point.Fired) {
    background-color: #18181b;
    color: #18181b;
  }

  :global(.vis-item.vis-range.Scheduled) {
    background-color: #e0e7ff;
    border-color: #4338ca;
    border-radius: 9999px;
    border-width: 2px;
    color: #4338ca;
  }

  :global(.vis-item.vis-point.Scheduled) {
    color: #4338ca;
  }

  :global(.vis-item.vis-range.ContinuedAsNew) {
    background-color: #f3e8ff;
    border-color: #581c87;
    border-radius: 9999px;
    border-width: 2px;
    color: #581c87;
  }

  :global(.vis-item.vis-point.ContinuedAsNew) {
    background-color: #581c87;
    color: #581c87;
  }

  :global(.vis-item.vis-range.Completed) {
    background-color: #dcfce7;
    border-color: #15803d;
    border-radius: 9999px;
    border-width: 2px;
    color: #15803d;
  }

  :global(.vis-item.vis-point.Completed) {
    background-color: #15803d;
    color: #15803d;
  }

  :global(.vis-item.vis-range.Running) {
    background-color: #dbeafe;
    border-color: #1d4ed8;
    border-radius: 9999px;
    border-width: 2px;
    color: #1d4ed8;
  }

  :global(.vis-item.vis-point.Running) {
    background-color: #1d4ed8;
    color: #1d4ed8;
  }

  :global(.vis-item.vis-range.Started) {
    background-color: #e4e4e7;
    border-color: #18181b;
    border-radius: 9999px;
    border-width: 2px;
    color: #18181b;
  }

  :global(.vis-item.vis-point.Started) {
    color: #18181b;
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
    display: flex;
    gap: 2px;
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
