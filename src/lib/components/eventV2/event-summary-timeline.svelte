<script lang="ts">
  import { groupEvents } from '$lib/models/event-groups';
  import type { CommonHistoryEvent } from '$lib/types/events';
  import { Timeline, DataSet, DataView } from 'vis-timeline/standalone';
  import Button from '$lib/holocene/button.svelte';
  import { onMount } from 'svelte';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { eventGroupDisplayName } from './event-detail-keys';

  export let fullHistory: CommonHistoryEvent[] = [];

  let visualizationRef;
  let timeline;

  const createGroupItems = (eventGroups, isRunning) => {
    const items = new DataSet([]);
    const groups = new DataSet([]);

    const firstEvent = fullHistory[0];
    const finalEvent = fullHistory[fullHistory.length - 1];
    groups.add({
      id: 'workflow',
      content: 'Workflow Execution',
      order: -1,
    });
    if (isRunning) {
      items.add({
        id: 'workflow',
        group: 'workflow',
        start: firstEvent.eventTime,
        end: Date.now(),
        type: 'range',
        content: 'Running',
        className: 'Running',
      });
    } else {
      items.add({
        id: 'workflow',
        group: 'workflow',
        start: firstEvent.eventTime,
        end: finalEvent.eventTime,
        type: 'range',
        content: finalEvent.classification,
        className: finalEvent.classification,
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
        className: lastEvent.classification,
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
        content: eventGroupDisplayName(group, false),
        order: i,
      });
    });

    return { items, groups };
  };

  const createOptions = (events) => {
    const defaults = {
      stack: false,
      stackSubgroups: true,
      maxHeight: 380,
      horizontalScroll: true,
      verticalScroll: true,
      groupHeightMode: 'fixed',
      zoomKey: 'ctrlKey',
      start: events[0]?.eventTime ?? Date.now(),
      end: events[events.length - 1]?.eventTime ?? Date.now() + 60 * 60 * 12,
      orientation: {
        axis: 'both',
        item: 'center',
      },
      // template: function (item, element, data) {
      //   var component = document.createElement('div');
      //   var inner = document.createElement('span');
      //   inner.className = 'large';
      //   inner.appendChild(
      //     document.createTextNode(data.data.lastEvent.classification),
      //   );
      //   component.appendChild(inner);
      //   // component.style.backgroundColor = background;

      //   return component;
      //   // return `<h1 style="background-color: ${background};">${data.data.lastEvent.classification}</h1>`;
      // },
    };
    return defaults;
  };

  onMount(() => {
    timeline = new Timeline(visualizationRef, new DataSet([]), new DataSet([]));
    return () => timeline.destroy();
  });

  const setVizItems = (items, groups, options) => {
    timeline.setGroups(groups);
    timeline.setItems(items);
    timeline.setOptions(options);
    timeline.fit();
  };

  $: {
    if (fullHistory.length && timeline) {
      const eventGroups = groupEvents(fullHistory);
      const { groups, items } = createGroupItems(
        eventGroups,
        $workflowRun.workflow.isRunning,
      );
      const options = createOptions(fullHistory);
      setVizItems(items, groups, options);
    }
  }

  const resetTimelineView = () => {
    timeline.focus('workflow');
  };
</script>

<div
  class="flex flex-col gap-4 bg-white border-2 border-gray-900 rounded-xl p-4"
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
    background-color: #f4f4f5;
    border-color: transparent;
    color: #3f3f46;
    font-size: 12px;
  }

  :global(.vis-item.dot .vis-dot) {
    border-color: #18181b;
  }

  .vis-item-overflow {
    overflow: visible !important;
  }

  :global(.vis-item.Completed) {
    background-color: #bbf7d0;
    border-color: #15803d;
    color: #15803d;
  }

  :global(
      .vis-item.Unspecified,
      .vis-item.Scheduled,
      .vis-item.Open,
      .vis-item.New,
      .vis-item.Started,
      .vis-item.Intitiated,) {
    background-color: #f3e8ff;
    border-color: #7e22ce;
    color: #7e22ce;
  }

  :global(.vis-item.Fired, .vis-item.TimedOut) {
    background-color: #ffedd5;
    border-color: #7c2d12;
    color: #7c2d12;
  }

  :global(.vis-item.Failed) {
    background-color: #fee2e2;
    border-color: #b91c1c;
    color: #b91c1c;
  }

  :global(.vis-item.Canceled) {
    background-color: #fef9c3;
    border-color: #713f12;
    color: #713f12;
  }

  :global(.vis-item.Terminated) {
    background-color: #e4e4e7;
    border-color: #18181b;
    color: #18181b;
  }

  :global(.vis-item.Running) {
    /* custom colors for selected orange items */
    background-color: #dbeafe;
    border-color: #1d4ed8;
    color: #1d4ed8;
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
</style>
