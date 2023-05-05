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

  export let fullHistory: CommonHistoryEvent[] = [];

  let visualizationRef;
  let timeline;

  function renderComponentToHTML(Component, props) {
    const container = document.createElement('div');
    new Component({ target: container, props });
    return container.innerHTML;
  }

  function renderGroupName(group, classification) {
    const groupName = eventGroupDisplayName(group, false);
    const groupStatus = renderComponentToHTML(EventClassification, {
      classification,
    });
    return `<div class="flex gap-2 items-center">${groupStatus}${groupName}</div>`;
  }

  function renderExecutionName(status) {
    const groupStatus = renderComponentToHTML(WorkflowStatus, {
      status,
    });
    return `<div class="flex gap-2 items-center">${groupStatus}<p>Workflow Execution<p></div>`;
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
      items.add({
        id: `event-range-${initialEvent.id}`,
        group: group.id,
        start: initialEvent.eventTime,
        content: group.name,
        end: lastEvent.eventTime,
        type: group.eventList.length === 1 ? 'point' : 'range',
        className: `${lastEvent.category} ${lastEvent.classification}`,
      });
      // items.add({
      //   id: `event-box-${initialEvent.id}`,
      //   group: group.id,
      //   start: lastEvent.eventTime,
      //   type: 'box',
      //   title: group.name,
      //   content: lastEvent?.classification ?? group.name,
      //   className: lastEvent.classification,
      // });
      // group.eventList.forEach((event) => {
      //   items.add({
      //     id: `event-${event.id}`,
      //     start: event.eventTime,
      //     group: group.id,
      //     type: 'point',
      //     style: 'top: -8px; z-index: 10;',
      //     title: event.classification,
      //     className: 'dot',
      //   });
      // });
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

  :global(.vis-item .vis-dot) {
    background-color: #18181b;
  }

  :global(.vis-item.dot .vis-dot) {
    border-color: #18181b;
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

  :global(.vis-item.vis-range.child-workflow) {
    background-color: #e0e7ff;
    border-color: #312e81;
    border-radius: 9999px;
    border-width: 2px;
    color: #312e81;
  }

  :global(.vis-item.vis-range.activity) {
    background-color: #ddd6fe;
    border-color: #6d28d9;
    border-radius: 9999px;
    border-width: 2px;
    color: #6d28d9;
  }

  :global(.vis-item.vis-range.marker) {
    background-color: #bfdbfe;
    border-color: #bfdbfe;
    border-radius: 9999px;
    border-width: 2px;
    color: #1d4ed8;
  }

  :global(.vis-item.vis-range.signal) {
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

  :global(.vis-item.vis-selected) {
    /* custom colors for selected orange items */
    background-color: #c7d2fe;
    border-color: #4338ca;
    color: #4338ca;
  }

  :global(.vis-item.dot.vis-selected) {
    background-color: transparent;
  }

  :global(.vis-group-level-unknown-but-gte1) {
    border: none;
  }
</style>
