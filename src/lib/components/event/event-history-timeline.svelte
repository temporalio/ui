<script lang="ts">
  import { groupEvents } from '$lib/models/event-groups';
  import type { CommonHistoryEvent } from '$lib/types/events';
  import {
    Timeline,
    DataSet,
    type TimelineOptionsGroupHeightModeType,
    type TimelineOptionsZoomKey,
  } from 'vis-timeline/standalone';
  import Button from '$lib/holocene/button.svelte';
  import { onMount } from 'svelte';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';

  export let history: CommonHistoryEvent[] = [];

  let visualizationRef;
  let timeline;

  function renderComponentToHTML(Component, props) {
    const container = document.createElement('div');
    new Component({ target: container, props });
    return container.innerHTML;
  }
  function renderGroupName(group, classification) {
    const groupName = capitalize(group.category);
    return `<div class="flex gap-2 items-center">${groupName}</div>`;
  }
  function renderExecutionName(status) {
    return `<div class="flex gap-1 items-center">Workflow Execution</div>`;
  }
  function renderPendingAttempts(name, attempt) {
    const retryIcon = renderComponentToHTML(Icon, {
      name: 'retry',
    });
    return `<div class="flex gap-1 items-center justify-between"><div class="bar-content"><p>${name}</p></div><div class="flex gap-1 items-center">${retryIcon}${attempt.toString()}</div></div>`;
  }
  const createGroupItems = (eventGroups, isRunning) => {
    const items = new DataSet([]);
    const groups = new DataSet([]);
    const firstEvent = history[0];
    const finalEvent = history[history.length - 1];
    if ($workflowRun?.workflow?.status) {
      groups.add({
        id: 'workflow',
        content: renderExecutionName($workflowRun.workflow.status),
        order: -1,
      });
    }
    if (isRunning) {
      items.add({
        id: 'workflow',
        group: 'workflow',
        start: firstEvent.eventTime,
        end: Date.now(),
        type: 'range',
        content: $workflowRun.workflow.runId,
        className: `${finalEvent.category} Running`,
      });
    } else {
      items.add({
        id: 'workflow',
        group: 'workflow',
        start: firstEvent.eventTime,
        end: finalEvent.eventTime,
        type: 'range',
        content: $workflowRun.workflow.runId,
        className: `${finalEvent.category} ${finalEvent.classification}`,
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
        });
      } else {
        items.add({
          id: `event-range-${initialEvent.id}`,
          group: group.id,
          start: initialEvent.eventTime,
          content:
            group.eventList.length === 1
              ? group.name
              : `<div class="bar-content">${group.name}</div>`,
          end: lastEvent.eventTime,
          type: group.eventList.length === 1 ? 'point' : 'range',
          className: `${lastEvent.category} ${lastEvent.classification}`,
        });
      }
      groups.add({
        id: group.id,
        content: renderGroupName(group, lastEvent.classification),
        order: i,
      });
    });
    return { items, groups };
  };
  const options = {
    stack: false,
    stackSubgroups: true,
    maxHeight: 600,
    horizontalScroll: true,
    verticalScroll: true,
    groupHeightMode: 'fixed' as TimelineOptionsGroupHeightModeType,
    zoomKey: 'ctrlKey' as TimelineOptionsZoomKey,
    orientation: {
      axis: 'both',
      item: 'center',
    },
    xss: {
      disabled: true,
      filterOptions: {
        whiteList: {
          p: ['class'],
          div: ['class'],
          h1: ['class'],
          input: ['class', 'id', 'check'],
          label: ['class', 'id', 'for'],
          li: ['class'],
          ul: ['class'],
        },
      },
    },
  };
  onMount(() => {
    timeline = new Timeline(
      visualizationRef,
      new DataSet([]),
      new DataSet([]),
      options,
    );
    return () => timeline.destroy();
  });
  const setVizItems = (items, groups) => {
    timeline.setGroups(groups);
    timeline.setItems(items);
    timeline.fit();
  };

  $: {
    if (history.length && timeline) {
      const reverseHistory =
        $eventFilterSort === 'descending' && $eventViewType !== 'compact';
      const eventGroups = groupEvents(
        reverseHistory ? history.reverse() : history,
      );
      const { groups, items } = createGroupItems(
        eventGroups,
        $workflowRun?.workflow?.isRunning,
      );
      setVizItems(items, groups);
    }
  }
  const resetTimelineView = () => {
    timeline.focus('workflow');
  };
</script>

<div
  class="flex flex-col gap-4 bg-white border-2 border-gray-900 rounded-xl p-4 w-full"
>
  <div class="flex justify-between items-center gap-2">
    <h3 class="text-xl">Timeline</h3>
    <div class="flex gap-2">
      <Button variant="secondary" on:click={() => timeline.zoomIn(1)}
        >Zoom In</Button
      >
      <Button variant="secondary" on:click={() => timeline.zoomOut(1)}
        >Zoom Out</Button
      >
      <Button variant="secondary" on:click={resetTimelineView}
        >Zoom to Fit</Button
      >
    </div>
  </div>
  <div bind:this={visualizationRef} />
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

  :global(.vis-item) {
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
