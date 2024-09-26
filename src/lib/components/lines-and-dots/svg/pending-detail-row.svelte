<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveEvent } from '$lib/stores/active-events';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { PendingActivity } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    formatAttemptsLeft,
    formatRetryExpiration,
  } from '$lib/utilities/format-event-attributes';
  import { formatDuration, getDuration } from '$lib/utilities/format-time';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  import {
    DetailsConfig,
    getPendingEventDetailHeight,
    staticCodeBlockHeight,
  } from '../constants';

  import Box from './box.svelte';
  import Text from './text.svelte';

  export let event: PendingActivity;
  export let group: EventGroup | undefined = undefined;
  export let x = 0;
  export let y: number;
  export let width: number;
  export let active = false;

  const { gutter, fontSizeRatio } = DetailsConfig;

  $: eventY = y;
  $: textStartingY = eventY + 1.5 * fontSizeRatio;
  $: retrying = event.attempt > 1;
</script>

{#if active}
  <foreignObject {x} y={eventY - 20} {width} height={fontSizeRatio}>
    <button
      class="flex items-center gap-0.5 rounded-t bg-white pl-1.5 pr-0.5 text-sm text-black"
      on:click|stopPropagation={() => setActiveEvent(event, group)}
    >
      {translate('common.close')}<Icon name="close" />
    </button>
  </foreignObject>
  <Box
    point={[x, eventY]}
    {width}
    height={getPendingEventDetailHeight(event)}
    fill={retrying ? '#FFE4D4' : '#E0EAFF'}
  />
{/if}
<Text
  point={[x + gutter, eventY + 0.75 * fontSizeRatio]}
  category="none"
  fontSize="16px"
  fontWeight="500">{retrying ? 'Retrying' : 'Pending'}</Text
>
<foreignObject
  x={x + gutter}
  y={textStartingY}
  width={width - gutter}
  height={fontSizeRatio}
>
  <div
    class="flex items-center gap-2 text-xs text-black md:text-sm"
    style="height: {fontSizeRatio}px;"
  >
    <div class="font-medium leading-3">
      {translate('workflows.attempt')}
    </div>
    <div class="text-wrap break-all leading-3">
      {event.attempt}
    </div>
  </div>
</foreignObject>
<foreignObject
  x={x + gutter}
  y={textStartingY + fontSizeRatio}
  width={width - gutter}
  height={fontSizeRatio}
>
  <div
    class="flex items-center gap-2 text-xs text-black md:text-sm"
    style="height: {fontSizeRatio}px;"
  >
    <div class="font-medium leading-3">
      {translate('workflows.attempts-left')}
    </div>
    <div class="text-wrap break-all leading-3">
      {formatAttemptsLeft(event.maximumAttempts, event.attempt)}
    </div>
  </div>
</foreignObject>
<foreignObject
  x={x + gutter}
  y={textStartingY + 2 * fontSizeRatio}
  width={width - gutter}
  height={fontSizeRatio}
>
  <div
    class="flex items-center gap-2 text-xs text-black md:text-sm"
    style="height: {fontSizeRatio}px;"
  >
    <div class="font-medium leading-3">
      {translate('workflows.last-heartbeat')}
    </div>
    <div class="text-wrap break-all leading-3">
      {formatDate(event.lastHeartbeatTime, $timeFormat, {
        relative: $relativeTime,
      }) || '-'}
    </div>
  </div>
</foreignObject>
<foreignObject
  x={x + gutter}
  y={textStartingY + 3 * fontSizeRatio}
  width={width - gutter}
  height={fontSizeRatio}
>
  <div
    class="flex items-center gap-2 text-xs text-black md:text-sm"
    style="height: {fontSizeRatio}px;"
  >
    <div class="font-medium leading-3">
      {translate('workflows.next-retry')}
    </div>
    <div class="text-wrap break-all leading-3">
      {toTimeDifference({
        date: event.scheduledTime,
        negativeDefault: 'None',
      })}
    </div>
  </div>
</foreignObject>
<foreignObject
  x={x + gutter}
  y={textStartingY + 4 * fontSizeRatio}
  width={width - gutter}
  height={fontSizeRatio}
>
  <div
    class="flex items-center gap-2 text-xs text-black md:text-sm"
    style="height: {fontSizeRatio}px;"
  >
    <div class="font-medium leading-3">
      {translate('workflows.expiration')}
    </div>
    <div class="text-wrap break-all leading-3">
      {formatRetryExpiration(
        event.maximumAttempts,
        formatDuration(
          getDuration({
            start: Date.now(),
            end: event.expirationTime,
          }),
        ),
      )}
    </div>
  </div>
</foreignObject>
{#if event?.heartbeatDetails}
  <foreignObject
    x={x + gutter}
    y={textStartingY + 5 * fontSizeRatio}
    width={width - 2 * gutter}
    height={staticCodeBlockHeight}
  >
    <div class="text-xs font-medium leading-3 md:text-sm">
      {translate('workflows.heartbeat-details')}
    </div>
    <CodeBlock
      content={stringifyWithBigInt(event.heartbeatDetails)}
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      maxHeight={staticCodeBlockHeight - fontSizeRatio}
    />
  </foreignObject>
{/if}
{#if event?.lastFailure}
  <foreignObject
    x={x + gutter}
    y={event?.heartbeatDetails
      ? textStartingY + 5 * fontSizeRatio + staticCodeBlockHeight
      : textStartingY + 5 * fontSizeRatio}
    width={width - 2 * gutter}
    height={staticCodeBlockHeight}
  >
    <div class="text-xs font-medium leading-3 md:text-sm">
      {translate('workflows.last-failure')}
    </div>
    <CodeBlock
      content={stringifyWithBigInt(event.lastFailure)}
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      maxHeight={staticCodeBlockHeight - fontSizeRatio}
    />
  </foreignObject>
{/if}
