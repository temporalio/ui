<script lang="ts">
  import { groupEvents } from '$lib/models/event-groups';
  import type { CommonHistoryEvent } from '$lib/types/events';
  import { Timeline, DataSet, DataView } from 'vis-timeline/standalone';

  export let fullHistory: CommonHistoryEvent[] = [];

  let visualizationRef;

  $: eventGroups = groupEvents(fullHistory);

  const createGroupItems = (eventGroups) => {
    const items = [];
    const groups = [];
    eventGroups.forEach((group, i) => {
      const initialEvent = group.eventList[0];
      items.push({
        id: initialEvent.id,
        group: group.id,
        content: `<h1>${initialEvent.classification}</h1>`,
        start: initialEvent.eventTime,
        end: group.lastEvent.eventTime,
        type: 'range',
      });
      groups.push({
        id: group.id,
        content: group.name,
        order: i,
      });
    });

    return { items, groups };
  };

  const createOptions = (events) => {
    const defaults = {
      stack: false,
      // maxHeight: 640,
      horizontalScroll: false,
      verticalScroll: true,
      zoomKey: 'ctrlKey',
      start: events[0].eventTime,
      end: events[events.length - 1].eventTime,
      orientation: {
        axis: 'both',
        item: 'center',
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

<div bind:this={visualizationRef} />

<style lang="postcss">
  .red {
    background: red;
  }
</style>
