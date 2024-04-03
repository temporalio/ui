<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import {
    format,
    spaceBetweenCapitalLetters,
  } from '$lib/utilities/format-camel-case';
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
  export let active = false;

  const { gutter, fontSizeRatio } = DetailsConfig;

  const labelPadding = 240;
  $: textStartingY = y + 1.5 * fontSizeRatio;
  $: attributes = formatAttributes(event);
  $: codeBlockAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value === 'object',
  );
  $: textAttributes = Object.entries(attributes).filter(
    ([, value]) => typeof value !== 'object',
  );

  $: width = event ? (4 * canvasWidth) / 5 : canvasWidth;

  $: y =
    index === 0
      ? y
      : index === 1
      ? y + getEventDetailsBoxHeight(group.eventList[0])
      : y +
        getEventDetailsBoxHeight(group.eventList[0]) +
        getEventDetailsBoxHeight(group.eventList[1]);
</script>

{#if active}
  <Box
    point={[x, y]}
    {width}
    height={getEventDetailsBoxHeight(event)}
    fill="#667CA1"
  />
{/if}
<Text point={[x + 0.5 * fontSizeRatio, y + 0.5 * fontSizeRatio]} fontSize="12px"
  >{event.id}<tspan dx={5}>{spaceBetweenCapitalLetters(event?.name)}</tspan
  ></Text
>
{#each codeBlockAttributes as [key, value], index (key)}
  {@const blockX = x + gutter + 0.5 * width}
  {@const y = textStartingY + index * staticCodeBlockHeight}
  <Text point={[blockX, y]}>{format(key)}</Text>
  <GroupDetailsText
    point={[blockX, y + 1.5 * fontSizeRatio]}
    {key}
    {value}
    {attributes}
    width={0.5 * width - 2 * gutter}
  />
{/each}
{#each textAttributes as [key, value], index (key)}
  <foreignObject
    x={x + gutter}
    y={textStartingY + index * fontSizeRatio}
    width={0.5 * width - gutter}
    height={fontSizeRatio}
  >
    <div class="flex gap-1 text-wrap text-sm text-white">
      <div class="w-48">{format(key)}</div>
      <GroupDetailsText
        point={[
          x + gutter + labelPadding,
          textStartingY + index * fontSizeRatio,
        ]}
        {key}
        {value}
        {attributes}
        {width}
      />
    </div>
  </foreignObject>
{/each}
<Line
  startPoint={[x, y + getEventDetailsBoxHeight(event)]}
  endPoint={[x + width, y + getEventDetailsBoxHeight(event)]}
  strokeWidth={3}
/>
