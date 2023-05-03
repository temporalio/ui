<script lang="ts">
  import { groupEvents } from '$lib/models/event-groups';
  import type { CommonHistoryEvent } from '$lib/types/events';
  import { Timeline, DataSet, DataView } from 'vis-timeline/standalone';
  import WorkflowStatus from '../workflow-status.svelte';
  import { allEventTypeOptions } from '$lib/models/event-history/get-event-categorization';
  import Button from '$lib/holocene/button.svelte';

  export let fullHistory: CommonHistoryEvent[] = [];

  let visualizationRef;
  let timeline;

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
        className: group.category,
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

        // let component = svelteHTML.createElement('h1', {
        //   style: `background-color: ${background};`,
        // });
        // return component;

        var component = document.createElement('div');
        var inner = document.createElement('span');
        inner.className = 'large';
        inner.appendChild(
          document.createTextNode(data.data.lastEvent.classification),
        );
        component.appendChild(inner);
        // component.style.backgroundColor = background;

        return component;
        // return `<h1 style="background-color: ${background};">${data.data.lastEvent.classification}</h1>`;
      },
    };
    return defaults;
  };

  $: {
    if (eventGroups.length && visualizationRef) {
      const { groups, items } = createGroupItems(eventGroups);
      const options = createOptions(fullHistory);
      timeline = new Timeline(visualizationRef, items, groups, options);
    }
  }

  const resetTimelineView = () => {
    timeline.fit();
  };
</script>

<div class="flex justify-end gap-2">
  <Button on:click={resetTimelineView}>Reset</Button>
</div>
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
    color: white;
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
</style>
