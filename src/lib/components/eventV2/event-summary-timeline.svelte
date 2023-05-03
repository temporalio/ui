<script lang="ts">
  import { groupEvents } from '$lib/models/event-groups';
  import type { CommonHistoryEvent } from '$lib/types/events';
  import { Timeline, DataSet, DataView } from 'vis-timeline/standalone';
  import WorkflowStatus from '../workflow-status.svelte';
  import { allEventTypeOptions } from '$lib/models/event-history/get-event-categorization';

  export let fullHistory: CommonHistoryEvent[] = [];

  let visualizationRef;

  $: eventGroups = groupEvents(fullHistory);

  const createGroupItems = (eventGroups) => {
    const items = [];
    const groups = [];
    eventGroups.forEach((group, i) => {
      const initialEvent = group.initialEvent;
      const lastEvent = group?.lastEvent;
      items.push({
        id: initialEvent.id,
        group: group.id,
        start: initialEvent.eventTime,
        end: lastEvent.eventTime,
        type: 'range',
        data: group,
      });
      groups.push({
        id: group.id,
        content: group.name,
        order: i,
        data: group,
      });
    });

    return { items: new DataSet(items), groups: new DataSet(groups) };
  };

  const createOptions = (events) => {
    const defaults = {
      stack: false,
      // maxHeight: 640,
      horizontalScroll: true,
      verticalScroll: true,
      showTooltips: true,
      zoomKey: 'ctrlKey',
      start: events[0].eventTime,
      end: events[events.length - 1].eventTime,
      orientation: {
        axis: 'both',
        item: 'center',
      },
      template: function (item, element, data) {
        const background = allEventTypeOptions.find(
          (o) => o.option === data.data.category,
        ).color;
        return `<h1 style="background-color: ${background};">${data.data.lastEvent.classification}</h1>`;
      },
    };
    return defaults;
  };

  $: {
    if (eventGroups.length && visualizationRef) {
      const { groups, items } = createGroupItems(eventGroups);
      const options = createOptions(fullHistory);
      const timeline = new Timeline(visualizationRef, items, groups, options);
    }
  }
</script>

{#key fullHistory}
  <div bind:this={visualizationRef} />
{/key}

<style lang="postcss">
  :global(.vis-item) {
    border-color: #fff;
    background-color: #86efac;
    min-width: 10px;
    font-size: 12px;
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
    color: white;
  }

  :global(.vis-background, .vis-timeline) {
    background-color: #18181b;
    color: white;
    border-radius: 0.75rem;
    border-width: 2px;
    border: 2px solid black;
  }

  :global(.vis-content, .vis-group) {
    background-color: white;
  }
</style>
