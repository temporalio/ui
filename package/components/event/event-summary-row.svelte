<script>var _a;
import Icon from '$holocene/icon/icon.svelte';
import { eventSortOrder, eventShowElapsed } from '../../stores/event-view';
import { timeFormat } from '../../stores/time-format';
import { workflowEventsColumnWidth, workflowEventsResponsiveColumnWidth, } from '../../stores/column-width';
import { getGroupForEvent, isEventGroup } from '../../models/event-groups';
import { eventOrGroupIsFailureOrTimedOut, eventOrGroupIsCanceled, eventOrGroupIsTerminated, } from '../../models/event-groups/get-event-in-group';
import { formatDate, formatDistanceAbbreviated, } from '../../utilities/format-date';
import { getSingleAttributeForEvent } from '../../utilities/get-single-attribute-for-event';
import { getTruncatedWord } from '../../utilities/get-truncated-word';
import EventDetailsRow from './event-details-row.svelte';
import EventDetailsFull from './event-details-full.svelte';
export let event;
export let groups;
export let visibleItems;
export let initialItem;
export let compact = false;
export let expandAll = false;
let selectedId = event.id;
let eventGroup = isEventGroup(event)
    ? event
    : getGroupForEvent(event, groups);
$: expanded = expandAll;
$: currentEvent = compact ? eventGroup.events.get(selectedId) : event;
$: descending = $eventSortOrder === 'descending';
$: showElapsed = $eventShowElapsed === 'true';
$: timeDiffChange = '';
$: {
    const currentIndex = visibleItems.indexOf(event);
    const previousItem = visibleItems[currentIndex - 1];
    if (previousItem) {
        const timeDiff = formatDistanceAbbreviated({
            start: compact
                ? (_a = previousItem === null || previousItem === void 0 ? void 0 : previousItem.initialEvent) === null || _a === void 0 ? void 0 : _a.eventTime
                : previousItem === null || previousItem === void 0 ? void 0 : previousItem.eventTime,
            end: compact ? currentEvent === null || currentEvent === void 0 ? void 0 : currentEvent.eventTime : event === null || event === void 0 ? void 0 : event.eventTime,
        });
        timeDiffChange = timeDiff ? `(${descending ? '-' : '+'}${timeDiff})` : '';
    }
}
const onLinkClick = () => {
    expanded = !expanded;
};
const failure = eventOrGroupIsFailureOrTimedOut(compact ? eventGroup : event);
const canceled = eventOrGroupIsCanceled(compact ? eventGroup : event);
const terminated = eventOrGroupIsTerminated(compact ? eventGroup : event);
let truncateWidth;
workflowEventsColumnWidth.subscribe((value) => {
    if (value !== 0)
        truncateWidth = value;
});
workflowEventsResponsiveColumnWidth.subscribe((value) => {
    if (value !== 0)
        truncateWidth = value;
});
</script>

<tr
  class="row"
  id={event.id}
  class:expanded={expanded && !expandAll}
  class:failure
  class:canceled
  class:terminated
  data-cy="event-summary-row"
  on:click|stopPropagation={onLinkClick}
>
  <td class="id-cell text-left">
    <a class="mx-1 text-sm text-gray-500 md:text-base" href="#{event.id}"
      >{event.id}</a
    >
  </td>
  <td class="cell flex w-1/4 text-left">
    <a
      class="mx-1 text-sm text-gray-500 md:text-base xl:hidden"
      href="#{event.id}">{event.id}</a
    >
    <p class="m-0 text-sm md:text-base">
      {#if showElapsed && event.id !== initialItem.id}
        {formatDistanceAbbreviated({
          start: initialItem.eventTime,
          end: currentEvent.eventTime,
        })}
        {timeDiffChange}
      {:else}
        {formatDate(event?.eventTime, $timeFormat)}
      {/if}
    </p>
  </td>
  <td class="cell w-10 text-right text-sm font-normal xl:text-left">
    <p tabindex="0" class="event-name text-sm font-semibold md:text-base">
      {#if compact && failure}
        <Icon class="inline text-red-700" name="clock" />
      {/if}
      {#if compact && canceled}
        <Icon class="inline text-yellow-700" name="clock" />
      {/if}
      {#if compact && terminated}
        <Icon class="inline text-pink-700" name="clock" />
      {/if}
      {getTruncatedWord(event.name, truncateWidth - 30)}
    </p>
  </td>
  <td class="cell links">
    {#if !expanded}
      <EventDetailsRow {...getSingleAttributeForEvent(currentEvent)} inline />
    {/if}
  </td>
  <td class="cell text-right">
    <Icon class="inline" name={expanded ? 'chevron-up' : 'chevron-down'} />
  </td>
</tr>
{#if expanded}
  <tr class="expanded-row">
    <td class="expanded-cell" colspan="5">
      <EventDetailsFull
        event={currentEvent}
        {compact}
        {eventGroup}
        bind:selectedId
      />
    </td>
  </tr>
{/if}

<style>
  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    border-bottom-width: 2px;
    --tw-border-opacity: 1;
    border-color: rgb(63 63 70 / var(--tw-border-opacity));
    font-size: 0.875rem;
    line-height: 1.25rem;
    -webkit-text-decoration-line: none;
            text-decoration-line: none;
}

.row:last-of-type {
    border-bottom-width: 0px;
}

@media (min-width: 1280px) {

    .row {
        display: table-row;
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
        font-size: 1rem;
        line-height: 1.5rem;
    }
}

  .row:hover {
    cursor: pointer;
    --tw-bg-opacity: 1;
    background-color: rgb(250 250 250 / var(--tw-bg-opacity));
}

  .expanded.row {
    border-bottom-width: 0px;
}

  .failure, 
  .failure:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(254 242 242 / var(--tw-bg-opacity));
}

  .failure .event-name {
    --tw-text-opacity: 1;
    color: rgb(185 28 28 / var(--tw-text-opacity));
}

  .canceled, 
  .canceled:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(254 252 232 / var(--tw-bg-opacity));
}

  .canceled .event-name {
    --tw-text-opacity: 1;
    color: rgb(161 98 7 / var(--tw-text-opacity));
}

  .terminated, 
  .terminated:hover {
    --tw-bg-opacity: 1;
    background-color: rgb(253 242 248 / var(--tw-bg-opacity));
}

  .terminated .event-name {
    --tw-text-opacity: 1;
    color: rgb(190 24 93 / var(--tw-text-opacity));
}

  .cell {
    --tw-border-opacity: 1;
    border-color: rgb(63 63 70 / var(--tw-border-opacity));
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    padding-top: 0.25rem;
    padding-bottom: 0px;
    line-height: 1rem;
}

  @media (min-width: 1280px) {

    .cell {
        display: table-cell;
        border-bottom-width: 2px;
    }
}

  .cell {
    flex: 40%;
  }

  .id-cell {
    display: none;
    --tw-border-opacity: 1;
    border-color: rgb(63 63 70 / var(--tw-border-opacity));
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    line-height: 1rem;
}

  @media (min-width: 1280px) {

    .id-cell {
        display: table-cell;
        border-bottom-width: 2px;
    }
}

  .expanded .cell, 
  .expanded .id-cell {
    border-bottom-width: 0px;
}

  .row:last-of-type .cell, 
  .row:last-of-type .id-cell {
    border-bottom-width: 0px;
}

  .row:last-of-type .cell:first-of-type, 
  .row:last-of-type .id-cell:first-of-type {
    border-bottom-left-radius: 0.5rem;
}

  .row:last-of-type .cell:last-of-type, 
  .row:last-of-type .id-cell:last-of-type {
    border-bottom-right-radius: 0.5rem;
}

  .expanded-row {
    display: block;
}

  @media (min-width: 1280px) {

    .expanded-row {
        display: table-row;
        border-bottom-width: 2px;
        --tw-border-opacity: 1;
        border-color: rgb(63 63 70 / var(--tw-border-opacity));
    }
}

  .expanded-cell {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    border-bottom-width: 2px;
    --tw-border-opacity: 1;
    border-color: rgb(63 63 70 / var(--tw-border-opacity));
    font-size: 0.875rem;
    line-height: 1.25rem;
    -webkit-text-decoration-line: none;
            text-decoration-line: none;
}

  @media (min-width: 1280px) {

    .expanded-cell {
        display: table-cell;
        font-size: 1rem;
        line-height: 1.5rem;
    }
}</style>
