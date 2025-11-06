<script lang="ts">
  import { cva } from 'class-variance-authority';
  import type { Snippet } from 'svelte';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowEvent } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import PendingActivityCard from '../workflow/pending-activity/pending-activity-card.svelte';
  import PendingNexusOperationCard from '../workflow/pending-nexus-operation/pending-nexus-operation-card.svelte';
  import WorkflowStatus from '../workflow-status.svelte';

  import EventCard from './event-card.svelte';
  import PayloadDecoder from './payload-decoder.svelte';

  let {
    group = undefined,
    event = undefined,
    children = undefined,
    headerActions = undefined,
  }: {
    group?: EventGroup;
    event?: WorkflowEvent;
    children?: Snippet;
    headerActions?: Snippet;
  } = $props();

  const pendingEvent = $derived(
    group?.pendingActivity || group?.pendingNexusOperation,
  );
  const showEventGroup = $derived(
    group && (group.eventList.length > 1 || pendingEvent),
  );

  const durationBetweenEvents = (
    eventA: WorkflowEvent,
    eventB: WorkflowEvent,
  ) =>
    formatDistanceAbbreviated({
      start: eventA?.eventTime,
      end: eventB?.eventTime,
      includeMilliseconds: true,
    });

  const groupCategory = cva([''], {
    variants: {
      category: {
        workflow: 'bg-blue-600 text-white',
        activity: 'bg-purple-600 text-white',
        'child-workflow': 'bg-[#67e4f9] text-slate-900',
        timer: 'bg-yellow-600 text-white',
        signal: 'bg-pink-700 text-white',
        update: 'bg-blue-600 text-white',
        other: 'bg-slate-600 text-white',
        nexus: 'bg-indigo-600 text-white',
        'local-activity': 'bg-slate-600 text-white',
        default: 'bg-purple-600 text-white',
      },
      classification: {
        Failed: 'bg-red-800',
        Canceled: 'bg-yellow-700',
        TimedOut: 'bg-orange-700',
        Terminated: 'bg-gray-300',
      },
    },
  });

  const title = $derived(
    group ? group.displayName : event ? event.eventType : '',
  );
  const emptyValue = $derived(
    group.isPending ? 'Results will appear upon completion' : 'null',
  );
  const duration = $derived(
    formatDistanceAbbreviated({
      start: group?.initialEvent?.eventTime,
      end: group?.lastEvent?.eventTime,
      includeMilliseconds: true,
    }),
  );
  let status = $derived(group?.finalClassification || group?.classification);
  const showHeader = $derived(
    (group && group.eventList.length > 1) || pendingEvent,
  );

  $effect(() => {
    if (group?.pendingActivity) {
      if (group.pendingActivity.paused) {
        status = translate('workflows.paused');
      } else if (group.pendingActivity.attempt > 1) {
        status = translate('events.event-classification.retrying');
      } else {
        status = translate('events.event-classification.pending');
      }
    }
  });
</script>

<div
  class={groupCategory({
    category: group ? group?.category : event?.category,
    classification: group
      ? group.finalClassification || group.classification
      : event.classification,
  })}
>
  {#if showHeader}
    {@render header()}
  {/if}
  <div class="">
    {@render inputAndResults()}
    {#if showEventGroup}
      <div class="flex flex-col overflow-hidden">
        {@render eventCards()}
      </div>
    {:else if event}
      <div
        class="flex flex-1 cursor-default flex-col overflow-hidden bg-slate-900/50 shadow-md"
      >
        <div
          class="flex flex-col flex-wrap items-center justify-between gap-2 bg-slate-800/30 p-2 pr-8 hover:bg-slate-800/40 lg:flex-row"
        >
          <div class="space-between flex items-center gap-2 text-base">
            <p class="font-mono">{event.id}</p>
            <p class="font-medium">
              {event.name}
            </p>
          </div>
          <p class="text-xs xl:text-sm">
            {formatDate(event.eventTime, $timeFormat, {
              relative: $relativeTime,
            })}
          </p>
        </div>
        <EventCard {event} />
      </div>
    {/if}
    {@render children?.()}
  </div>
</div>

{#snippet header()}
  <div
    class="flex h-full items-center justify-between bg-slate-900/50 text-sm text-white"
  >
    <div
      class="flex h-full flex-row flex-wrap items-start gap-2 py-1 pl-2 text-base md:items-center md:gap-4"
    >
      {#if status}
        <WorkflowStatus {status} class="h-6 p-2 text-base" />
      {/if}
      {#if group?.pendingActivity?.attempt}
        <div class="flex items-center gap-1">
          <Icon name="retry" />
          {group.pendingActivity.attempt}
        </div>
      {/if}
      {title}
      {#if duration}
        <div class="flex items-center gap-1">
          <Icon name="clock" />
          {duration}
        </div>
      {/if}
    </div>
    <div class="flex items-center gap-4">
      {@render headerActions?.()}
    </div>
  </div>
{/snippet}

{#snippet inputAndResults()}
  {#if group?.input !== undefined || group?.category === 'activity' || group?.category === 'nexus'}
    <div class="flex flex-col items-start gap-2 p-2 lg:flex-row">
      {#if group?.input !== undefined}
        <div class="flex w-full flex-col">
          <p class="py-1 text-base font-medium">Input</p>
          <PayloadDecoder value={group?.input} key="payloads">
            {#snippet children(decodedValue)}
              <CodeBlock
                content={decodedValue}
                maxHeight={320}
                class="grow"
                copyIconTitle={translate('common.copy-icon-title')}
                copySuccessIconTitle={translate(
                  'common.copy-success-icon-title',
                )}
              />
            {/snippet}
          </PayloadDecoder>
        </div>
      {/if}
      {#if group?.category === 'activity' || group?.category === 'nexus'}
        <div class="flex w-full flex-col">
          <p class="py-1 text-base font-medium">Result</p>
          <PayloadDecoder value={group?.result} key="payloads">
            {#snippet children(decodedValue)}
              <CodeBlock
                content={decodedValue ?? emptyValue}
                maxHeight={320}
                copyIconTitle={translate('common.copy-icon-title')}
                copySuccessIconTitle={translate(
                  'common.copy-success-icon-title',
                )}
              />
            {/snippet}
          </PayloadDecoder>
        </div>
      {/if}
    </div>
  {/if}
{/snippet}

{#snippet eventCards()}
  {#if group?.eventList.length > 1 || pendingEvent}
    <div
      class="flex flex-col flex-wrap items-center justify-between gap-2 p-2 lg:flex-row"
    >
      {#each group.eventList as groupEvent, index}
        <div class="text-center lg:text-left">
          <div class="space-between flex items-center gap-2 leading-3">
            <p class="font-mono">{groupEvent.id}</p>
            <p class="font-medium">
              {groupEvent.name}
            </p>
          </div>
          <p class="text-xs xl:text-sm">
            {formatDate(event.eventTime, $timeFormat, {
              relative: $relativeTime,
            })}
          </p>
        </div>
        {#if index !== group.eventList.length - 1}
          <p
            class="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs xl:text-sm"
          >
            <Icon name="clock" />
            {durationBetweenEvents(
              group?.eventList[index],
              group?.eventList[index + 1],
            ) || '0ms'}
          </p>
        {/if}
      {/each}
      {#if group.isPending}
        <div class="space-between flex items-center gap-2 text-base">
          <p class="font-medium">Pending Activity</p>
        </div>
      {/if}
    </div>
  {/if}
  <div
    class="flex cursor-default flex-col overflow-hidden bg-slate-900/30 text-white"
  >
    <div class="flex flex-col xl:flex-row">
      {#each group.eventList as groupEvent}
        <EventCard event={groupEvent} />
      {/each}
      {#if group?.pendingActivity}
        <PendingActivityCard activity={group.pendingActivity} />
      {:else if group?.pendingNexusOperation}
        <PendingNexusOperationCard operation={group.pendingNexusOperation} />
      {/if}
    </div>
  </div>
{/snippet}
