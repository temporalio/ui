<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveEvent } from '$lib/stores/active-events';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowEvent } from '$lib/types/events';
  import {
    format,
    spaceBetweenCapitalLetters,
  } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';

  import {
    DetailsConfig,
    getEventDetailsBoxHeight,
    staticCodeBlockHeight,
  } from '../constants';

  import Box from './box.svelte';
  import GroupDetailsText from './group-details-text.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  export let event: WorkflowEvent;
  export let group: EventGroup | undefined = undefined;
  export let index: number = 0;
  export let x = 0;
  export let y: number;
  export let canvasWidth: number;
  export let width: number;
  export let active = false;

  const { gutter, fontSizeRatio } = DetailsConfig;

  $: attributes = formatAttributes(event, $timeFormat, $relativeTime);
  $: codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  $: textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );

  $: showTimestamp = canvasWidth > 800;
  $: eventY =
    index === 0
      ? y
      : index === 1
      ? y + getEventDetailsBoxHeight(group.eventList[0], group.pendingActivity)
      : y +
        getEventDetailsBoxHeight(group.eventList[0], group.pendingActivity) +
        getEventDetailsBoxHeight(group.eventList[1], group.pendingActivity);
  $: textStartingY = eventY + 1.5 * fontSizeRatio;
</script>

{#if active && !group?.pendingActivity}
  <foreignObject {x} y={y - 20} {width} height={fontSizeRatio}>
    <button
      class="flex items-center gap-0.5 rounded-t bg-white pl-1.5 pr-0.5 text-sm text-black"
      on:click|stopPropagation={() => setActiveEvent(event, group)}
    >
      {translate('common.close')}<Icon name="close" />
    </button>
  </foreignObject>
{/if}
<Box
  point={[x, eventY]}
  {width}
  height={1.25 * fontSizeRatio}
  fill={active ? '#444CE7' : ''}
/>
<Line
  startPoint={[x, eventY + 1.25 * fontSizeRatio]}
  endPoint={[x + width, eventY + 1.25 * fontSizeRatio]}
  strokeWidth={2}
/>
<foreignObject {x} y={eventY} {width} height={fontSizeRatio}>
  <div class="flex items-center justify-between px-2 py-1 text-sm text-white">
    <div class="flex items-center gap-2">
      {event.id}
      {spaceBetweenCapitalLetters(event?.name)}
    </div>
    {#if showTimestamp}
      <div class="text-xs">
        {formatDate(event?.eventTime, $timeFormat, {
          relative: $relativeTime,
        })}
      </div>
    {/if}
  </div>
</foreignObject>
{#each textAttributes as [key, value], index (key)}
  <foreignObject
    x={x + gutter}
    y={textStartingY + index * fontSizeRatio}
    width={width - gutter}
    height={fontSizeRatio}
  >
    <div
      class="flex items-center gap-2 text-xs text-white md:text-sm"
      style="height: {fontSizeRatio}px;"
    >
      <div class="font-medium leading-3 text-[#C9D9F0]">
        {format(key)}
      </div>
      <div class="text-wrap break-all leading-3">
        <GroupDetailsText {key} {value} {attributes} {width} />
      </div>
    </div>
  </foreignObject>
{/each}
{#each codeBlockAttributes as [key, value], index (key)}
  {@const blockX = x + gutter}
  {@const blockY =
    textStartingY +
    (textAttributes.length + 1) * fontSizeRatio +
    index * staticCodeBlockHeight}
  <Text point={[blockX, blockY]} label>{format(key)}</Text>
  <GroupDetailsText
    point={[blockX, blockY + 1.5 * fontSizeRatio]}
    {key}
    {value}
    {attributes}
    width={width - 2 * gutter}
  />
{/each}
<Line
  startPoint={[x - 1, eventY]}
  endPoint={[x + width, eventY]}
  strokeWidth={2}
/>
<Line
  startPoint={[x, eventY + getEventDetailsBoxHeight(event)]}
  endPoint={[x + width, eventY + getEventDetailsBoxHeight(event)]}
  strokeWidth={2}
/>
<Line
  startPoint={[x, eventY]}
  endPoint={[x, eventY + getEventDetailsBoxHeight(event)]}
  strokeWidth={2}
/>
