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

  let expanded = $state(false);
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
        'child-workflow': 'bg-[#67e4f9] text-secondary',
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

  const timeDot = cva(['h-3 w-3 rounded-full shadow-lg'], {
    variants: {
      classification: {
        Scheduled: 'bg-slate-500',
        Started: 'bg-slate-300',
        Completed: 'ring-2 ring-green-500 bg-green-300',
        Failed: 'ring-2 ring-red-500 bg-red-300',
        Canceled: 'ring-2 ring-yellow-400 bg-yellow-300',
        TimedOut: 'ring-2 ring-orange-400 bg-orange-300',
        ContinuedAsNew: 'ring-2 ring-blue-400 bg-blue-300',
        Terminated: 'ring-2 ring-gray-400 bg-gray-300',
        Pending: 'ring-2 ring-yellow-400 bg-yellow-300',
        Default: 'ring-2 ring-slate-400 bg-slate-300',
        Open: 'ring-2 ring-slate-400 bg-slate-300',
        Unspecified: 'ring-2 ring-slate-400 bg-slate-300',
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
    category: group ? group.category : event.category,
    classification: group
      ? group.finalClassification || group.classification
      : event.classification,
  })}
>
  {#if (group && group.eventList.length > 1) || pendingEvent}
    {@render header()}
  {/if}
  <div class="p-2">
    {@render inputAndResults()}
    {#if showEventGroup}
      <div class="flex flex-col overflow-hidden">
        {@render durationTimes()}
        {@render eventCards()}
      </div>
    {:else if event}
      <div
        class="flex flex-1 cursor-default flex-col overflow-hidden bg-slate-900/50 pb-2 shadow-md"
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
        </div>
        <EventCard {event} />
      </div>
    {/if}
    {@render children?.()}
  </div>
</div>

{#snippet header()}
  <div
    class="relative flex h-full items-center justify-between bg-slate-900/50 text-sm text-white"
  >
    <div
      class="flex h-full flex-col items-start gap-1 py-1 pl-2 text-base md:flex-row md:items-center md:gap-4"
    >
      {#if status}
        <WorkflowStatus {status} class="p-3" />
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
  <div class="flex flex-col gap-2 pb-2 lg:flex-row">
    {#if group?.input !== undefined}
      <div class={'flex w-full flex-col'}>
        <p class="text-base font-medium">Input</p>
        <PayloadDecoder value={group?.input} key="payloads">
          {#snippet children(decodedValue)}
            <CodeBlock
              content={decodedValue}
              maxHeight={320}
              class="grow"
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          {/snippet}
        </PayloadDecoder>
      </div>
    {/if}
    {#if group.category === 'activity' || group.category === 'nexus'}
      <div class="flex w-full flex-col">
        <p class="text-base font-medium">Result</p>
        <PayloadDecoder value={group?.result} key="payloads">
          {#snippet children(decodedValue)}
            <CodeBlock
              content={decodedValue ?? emptyValue}
              maxHeight={320}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          {/snippet}
        </PayloadDecoder>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet eventCards()}
  {#if group?.eventList.length > 1 || pendingEvent}
    <button
      class="flex flex-col flex-wrap items-center justify-between gap-2 bg-slate-900/30 p-2 pr-8 text-white hover:bg-slate-900/40 lg:flex-row"
      onclick={() => (expanded = !expanded)}
    >
      {#each group.eventList as groupEvent}
        <div class="space-between flex items-center gap-2 text-base">
          <p class="font-mono">{groupEvent.id}</p>
          <p class="font-medium">
            {groupEvent.name}
          </p>
        </div>
      {/each}
      {#if group.isPending}
        <div class="space-between flex items-center gap-2 text-base">
          <p class="font-medium">Pending Activity</p>
        </div>
      {/if}
      <Icon
        name={expanded ? 'chevron-up' : 'chevron-down'}
        class="right-4 lg:absolute"
      />
    </button>
  {/if}
  {#if expanded}
    <div
      class="flex cursor-default flex-col overflow-hidden bg-slate-900/50 pb-2 text-white shadow-md xl:flex-row"
    >
      {#each group.eventList as groupEvent}
        <EventCard event={groupEvent} />
      {/each}
      {#if group?.pendingActivity}
        <PendingActivityCard activity={group.pendingActivity} />
      {:else if group?.pendingNexusOperation}
        <PendingNexusOperationCard operation={group.pendingNexusOperation} />
      {/if}
    </div>
  {/if}
{/snippet}

{#snippet durationTimes()}
  <div class="flex flex-col gap-1 px-1 py-2">
    <div>
      <div
        class="flex flex-row justify-between gap-2 text-center text-xs md:text-sm"
      >
        {#each group.eventList as event, index}
          <p class="font-mono">
            {formatDate(event.eventTime, $timeFormat, {
              relative: $relativeTime,
            })}
          </p>

          {#if index !== group.eventList.length - 1}
            <p
              class="flex items-center gap-1 rounded bg-slate-900/30 px-1.5 py-0.5 font-mono"
            >
              <Icon name="clock" />
              {durationBetweenEvents(
                group?.eventList[index],
                group?.eventList[index + 1],
              ) || '0ms'}
            </p>
          {/if}
        {/each}
      </div>
      <div class="pt-1">
        <div
          class="w-full border-t-2 {group.isPending &&
            'border-dashed'} border-white"
        ></div>
        <div
          class="-mt-[7px] flex flex-row justify-between gap-1 text-xs xl:text-sm"
        >
          {#each group.eventList as event}
            <div
              class={timeDot({
                category: group ? group.category : event.category,
                classification: event.classification,
              })}
            ></div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/snippet}
