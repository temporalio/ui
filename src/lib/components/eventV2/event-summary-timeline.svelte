<script lang="ts">
  import { groupEvents } from '$lib/models/event-groups';
  import type { CommonHistoryEvent } from '$lib/types/events';

  import { Timeline, DataSet } from 'vis-timeline/standalone';
  import Button from '$lib/holocene/button.svelte';
  import { onMount } from 'svelte';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { eventGroupDisplayName } from './event-detail-keys';
  import EventTimelineCard from './event-timeline-card.svelte';
  import WorkflowStatus from '../workflow-status.svelte';
  import EventClassification from './event-summary-card/event-classification.svelte';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import Icon from '$lib/holocene/icon/icon.svelte';

  export let fullHistory: CommonHistoryEvent[] = [];

  $: {
    console.log('pending: ', $workflowRun.workflow.pendingActivities);
  }
  let visualizationRef;
  let timeline;

  function renderComponentToHTML(Component, props) {
    const container = document.createElement('div');
    new Component({ target: container, props });
    return container.innerHTML;
  }

  function renderGroupName(group, classification) {
    const groupName = capitalize(group.category);
    const groupStatus = renderComponentToHTML(EventClassification, {
      classification,
    });
    return `<div class="flex gap-2 items-center">${groupName}${groupStatus}</div>`;
  }

  function renderExecutionName(status) {
    const groupStatus = renderComponentToHTML(WorkflowStatus, {
      status,
    });
    return `<div class="flex gap-1 items-center"><p>Workflow Execution<p>${groupStatus}</div>`;
  }

  function renderPendingAttempts(name, attempt) {
    const retryIcon = renderComponentToHTML(Icon, {
      name: 'retry',
    });
    return `<div class="flex gap-1 items-center justify-between"><div class="bar-content"><span></span><p>${name}</p></div><div class="flex gap-1 items-center">${retryIcon}${attempt.toString()}</div></div>`;
  }

  const createGroupItems = (eventGroups, isRunning) => {
    const items = new DataSet([]);
    const groups = new DataSet([]);

    const firstEvent = fullHistory[0];
    const finalEvent = fullHistory[fullHistory.length - 1];
    groups.add({
      id: 'workflow',
      content: renderExecutionName($workflowRun.workflow.status),
      order: -1,
    });
    if (isRunning) {
      items.add({
        id: 'workflow',
        group: 'workflow',
        start: firstEvent.eventTime,
        end: Date.now(),
        type: 'range',
        content: $workflowRun.workflow.runId,
        className: `${finalEvent.category} ${finalEvent.classification}`,
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
      const groupPendingActivity = $workflowRun.workflow.pendingActivities.find(
        (activity) => group.eventList.find((e) => e.id === activity.activityId),
      );
      const isRunning =
        !group.isCanceled &&
        !group.isCompleted &&
        !group.isFailureOrTimedOut &&
        !group.isTerminated;
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
              : `<div class="bar-content"><span></span><p>${group.name}</p></div>`,
          end: lastEvent.eventTime,
          type: group.eventList.length === 1 ? 'point' : 'range',
          className: `${lastEvent.category} ${lastEvent.classification}`,
        });
      }

      groups.add({
        id: group.id,
        content: renderGroupName(group, lastEvent.classification),
        order: i,
        nestedGroups: [`${group.id}-nested`],
        showNested: false,
      });
      groups.add({
        id: `${group.id}-nested`,
        content: '',
      });
      items.add({
        id: `${group.id}-info`,
        group: `${group.id}-nested`,
        start: firstEvent.eventTime,
        end: finalEvent.eventTime,
        content: renderComponentToHTML(EventTimelineCard, {
          group,
        }),
        className: 'Card',
      });
    });

    return { items, groups };
  };

  const options = {
    stack: false,
    stackSubgroups: true,
    maxHeight: 800,
    horizontalScroll: true,
    verticalScroll: true,
    groupHeightMode: 'fixed',
    zoomKey: 'ctrlKey',
    orientation: {
      axis: 'both',
      item: 'center',
    },
    xss: {
      disabled: true,
      filterOptions: {
        whiteList: {
          p: 'class',
          div: 'class',
          h1: 'class',
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
    timeline.on('click', function (params, callback) {
      // Need to figure out how to prevent jump on group click
      params.event.preventDefault();
      params.event.stopPropagation();
      return;
    });
    return () => timeline.destroy();
  });

  const setVizItems = (items, groups) => {
    timeline.setGroups(groups);
    timeline.setItems(items);
    timeline.fit();
  };

  $: {
    if (fullHistory.length && timeline) {
      const eventGroups = groupEvents(fullHistory);
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
    <div class="flex gap-1">
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

  :global(.vis-item.vis-range.child-workflow) {
    background-color: #e0e7ff;
    border-color: #312e81;
    border-radius: 9999px;
    border-width: 2px;
    color: #312e81;
  }

  :global(.vis-item.vis-point.child-workflow) {
    background-color: #312e81;
    color: #312e81;
  }

  :global(.vis-item.vis-range.activity) {
    background-color: #faf5ff;
    border-color: #6d28d9;
    border-radius: 9999px;
    border-width: 2px;
    color: #6d28d9;
  }

  :global(.vis-item.vis-dot.activity) {
    background-color: #6d28d9;
    color: #6d28d9;
  }

  :global(.vis-item.vis-range.marker) {
    background-color: #bfdbfe;
    border-color: #bfdbfe;
    border-radius: 9999px;
    border-width: 2px;
    color: #1d4ed8;
  }

  :global(.vis-item.vis-point.marker) {
    background-color: #1d4ed8;
    color: #1d4ed8;
  }

  :global(.vis-item.vis-range.signal) {
    color: #652b19;
  }

  :global(.vis-item.vis-point.signal) {
    color: #652b19;
  }

  :global(.vis-item.vis-range.vis-point.signal .vis-dot) {
    background-color: #feebcb;
    border-color: #feebcb;
  }

  :global(.vis-item.vis-range.timer) {
    background-color: #feebcb;
    border-color: #652b19;
    border-radius: 9999px;
    border-width: 2px;
    color: #652b19;
  }

  :global(.vis-item.vis-point.timer) {
    color: #652b19;
  }

  :global(.bar-content) {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  :global(.bar-content span) {
    width: 8px;
    height: 8px;
    border: 1px solid black;
    border-radius: 9999px;
    background-color: white;
  }

  :global(.vis-item.vis-selected) {
    /* custom colors for selected orange items */
    background-color: #c7d2fe;
    border-color: #4338ca;
    color: #4338ca;
  }

  :global(.vis-item.vis-selected, .vis-item.vis-point.vis-selected) {
    background-color: transparent;
    border-radius: 9999px;
  }

  :global(.vis-group-level-unknown-but-gte1) {
    border: none;
  }
</style>
