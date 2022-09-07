<script>var _a, _b;
import VirtualList from '@sveltejs/svelte-virtual-list';
import { noop } from 'svelte/internal';
import Icon from '$holocene/icon/icon.svelte';
import { timelineEvents } from '../../stores/events';
import { formatDate, getTimestampDifference, } from '../../utilities/format-date';
import { timelineEventTypeOptions } from '../../models/event-history/get-event-categorization';
import { timeFormat } from '../../stores/time-format';
import EmptyState from '../../holocene/empty-state.svelte';
import { eventOrGroupIsCanceled, eventOrGroupIsFailureOrTimedOut, eventOrGroupIsTerminated, } from '../../models/event-groups/get-event-in-group';
export let events;
export let eventGroups;
export let isRunning;
let width;
let canvas;
let blockHeight = 30;
let xBuffer = 200;
let yBuffer = 10;
let activeGroup;
let mouseX = xBuffer;
function handleMouseMove(event) {
    const offset = canvas.getBoundingClientRect();
    const { x } = offset;
    const { clientX } = event;
    if (clientX && clientX - x > xBuffer) {
        mouseX = clientX - x;
    }
}
$: startDate = (_a = events[0]) === null || _a === void 0 ? void 0 : _a.eventTime;
$: endDate = isRunning
    ? new Date(Date.now())
    : (_b = events[events.length - 1]) === null || _b === void 0 ? void 0 : _b.eventTime;
$: totalDistance = getTimestampDifference(startDate, endDate);
$: currentDate = new Date(Date.parse(startDate) +
    (mouseX - xBuffer) * (totalDistance / (width - xBuffer)));
$: getDistance = (date) => {
    if (!date) {
        return 0;
    }
    const diff = getTimestampDifference(startDate, date);
    return diff * ((width - xBuffer) / totalDistance);
};
$: getGroupProperties = (group) => {
    var _a;
    const index = eventGroups.indexOf(group);
    const startDistance = getDistance(group.initialEvent.eventTime);
    const endDistance = getDistance(group.lastEvent.eventTime);
    const duration = endDistance - startDistance;
    const typeOption = timelineEventTypeOptions.find((o) => o.option == group.category);
    const top = index * blockHeight + yBuffer / 2;
    const failure = eventOrGroupIsFailureOrTimedOut(group);
    const canceled = eventOrGroupIsCanceled(group);
    const terminated = eventOrGroupIsTerminated(group);
    return {
        top,
        left: startDistance + xBuffer,
        right: duration < 5 ? startDistance + 5 : endDistance,
        width: Math.max(duration, 5),
        height: blockHeight / 2,
        color: (_a = typeOption === null || typeOption === void 0 ? void 0 : typeOption.color) !== null && _a !== void 0 ? _a : '#e4e4e7',
        failure,
        canceled,
        terminated,
    };
};
const handleGroupClick = (group) => {
    activeGroup = group.id;
    $timelineEvents = group.eventList;
};
</script>

{#if eventGroups.length}
  <div
    class="min-h-40 relative max-h-96 w-full cursor-crosshair overflow-auto rounded-lg border border-gray-900 bg-blueGray-50 bg-white"
    bind:clientWidth={width}
    on:mousemove={handleMouseMove}
  >
    <div
      bind:this={canvas}
      class="relative"
      style="height: {blockHeight * eventGroups.length +
        yBuffer}px; width: {width}px;"
    >
      <VirtualList
        items={eventGroups}
        let:item
        itemHeight={blockHeight}
        class="timeline-list"
      >
        {@const {
          top,
          left,
          width,
          height,
          color,
          failure,
          canceled,
          terminated,
        } = getGroupProperties(item)}
        <div
          class="event-group"
          style="top: {top +
            blockHeight /
              4}px; left: {left}px; width: {width}px; height: {height -
            1}px; background: {color};"
        />
        <button
          class="absolute truncate border-r border-gray-900 pl-2 text-left text-sm font-medium hover:bg-blueGray-200"
          class:event-group-active={$timelineEvents?.length &&
            activeGroup === item.id}
          class:failure
          class:canceled
          class:terminated
          style="top: {top}px; left: 0; width: {xBuffer}px; height: {blockHeight}px; font-size: 10px;"
          on:mousemove|stopPropagation={noop}
          on:click={() => handleGroupClick(item)}
        >
          {#if failure}
            <Icon class="inline text-red-700" name="clock" />
          {/if}
          {#if canceled}
            <Icon class="inline text-yellow-700" name="clock" />
          {/if}
          {#if terminated}
            <Icon class="inline text-pink-700" name="clock" />
          {/if}
          {item.name}
        </button>
      </VirtualList>
      <div
        class="absolute top-0 bg-blueGray-400"
        style="height: {blockHeight * eventGroups.length +
          yBuffer}px;left: {mouseX}px; width: 1px"
      />
    </div>
  </div>
{:else}
  <EmptyState title="No events" />
{/if}
<div class="md:text-md font-base text-sm">
  <div class="flex justify-end">
    <pre class="text-right">Start: {formatDate(startDate, $timeFormat)}</pre>
  </div>
  <div class="flex justify-end">
    <pre class="text-right">Current: {formatDate(
        currentDate,
        $timeFormat,
      )}</pre>
  </div>
  <div class="flex justify-end">
    <pre class="text-right">{isRunning ? 'Last' : 'End'}: {formatDate(
        endDate,
        $timeFormat,
      )}</pre>
  </div>
</div>

<style>
  .event-group {
    position: absolute;
    border-radius: 0.125rem;
    text-align: center;
    --tw-drop-shadow: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
    filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)
}
  .event-group-active {
    --tw-bg-opacity: 1;
    background-color: rgb(226 232 240 / var(--tw-bg-opacity))
}
  .failure {
    --tw-bg-opacity: 1;
    background-color: rgb(254 226 226 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(185 28 28 / var(--tw-text-opacity))
}
  .failure:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(254 202 202 / var(--tw-bg-opacity))
}
  .event-group-active.failure {
    --tw-bg-opacity: 1;
    background-color: rgb(254 202 202 / var(--tw-bg-opacity))
}
  .canceled {
    --tw-bg-opacity: 1;
    background-color: rgb(254 249 195 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(161 98 7 / var(--tw-text-opacity))
}
  .canceled:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(254 240 138 / var(--tw-bg-opacity))
}
  .event-group-active.canceled {
    --tw-bg-opacity: 1;
    background-color: rgb(254 240 138 / var(--tw-bg-opacity))
}
  .terminated {
    --tw-bg-opacity: 1;
    background-color: rgb(252 231 243 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(190 24 93 / var(--tw-text-opacity))
}
  .terminated:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(251 207 232 / var(--tw-bg-opacity))
}
  .event-group-active.terminated {
    --tw-bg-opacity: 1;
    background-color: rgb(251 207 232 / var(--tw-bg-opacity))
}</style>
