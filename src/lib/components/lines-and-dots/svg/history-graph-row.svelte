<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveEvent } from '$lib/stores/active-events';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

  import { CategoryIcon, getCategoryColor, HistoryConfig } from '../constants';

  import Box from './box.svelte';

  export let event: WorkflowEvent;
  export let group: EventGroup;
  export let activeEvents: string[] = [];

  export let canvasWidth: number;
  export let visualWidth: number;
  export let index: number;

  const { height, radius } = HistoryConfig;

  $: y = index * height + height / 2;
  $: isActiveEvent = activeEvents.includes(event.id);
  $: showTimestamp = canvasWidth > 1200;
  $: showDetails = canvasWidth > 800;
  $: classification = group?.pendingActivity
    ? group.pendingActivity.attempt > 1
      ? 'retry'
      : 'pending'
    : event.classification;
  $: detailsWidth = canvasWidth - visualWidth;
  $: isLocalActivity = isLocalActivityMarkerEvent(event);
  $: icon = isLocalActivity
    ? CategoryIcon['local-activity']
    : CategoryIcon[event.category];
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={() => setActiveEvent(event, group)}
  on:keypress={() => setActiveEvent(event, group)}
  class="relative cursor-pointer"
>
  <Box
    point={[visualWidth + 2, y - height / 2]}
    width={detailsWidth}
    {height}
    {classification}
    fill={isActiveEvent ? '#444CE7' : index % 2 === 1 && '#1E293B'}
  />
  <foreignObject
    x={visualWidth + 2 * radius}
    y={y - height / 2}
    width={detailsWidth}
    {height}
  >
    <div
      class="flex items-center justify-between px-2 text-sm text-white"
      style="height: {height}px;"
    >
      <div class="flex gap-4">
        {event.id}
        <div class="flex items-center gap-1">
          <Icon name={icon} class="text-white" />
          {spaceBetweenCapitalLetters(
            isLocalActivity ? 'LocalActivity' : event?.name,
          )}
          {#if group && group.displayName && showDetails}<span
              style="color: {getCategoryColor(group.category)}"
              >{group.displayName}</span
            >{/if}
        </div>
      </div>
      {#if showTimestamp}
        <span class="px-3 text-xs text-slate-100"
          >{formatDate(event?.eventTime, $timeFormat, {
            relative: $relativeTime,
          })}</span
        >
      {/if}
    </div>
  </foreignObject>
</g>

<style lang="postcss">
  g {
    outline: none;
  }
</style>
