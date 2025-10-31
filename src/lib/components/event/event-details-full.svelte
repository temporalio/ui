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

  import EventCard from './event-card.svelte';
  import PayloadDecoder from './payload-decoder.svelte';

  let {
    group = undefined,
    event = undefined,
    children = undefined,
  }: {
    group?: EventGroup;
    event?: WorkflowEvent;
    children?: Snippet;
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

  const groupCategory = cva(['p-2 text-white'], {
    variants: {
      category: {
        workflow: 'bg-blue-600 ',
        activity: 'bg-purple-600',
        'child-workflow': 'bg-green-700 ',
        timer: 'bg-yellow-600 ',
        signal: 'bg-pink-700 ',
        update: 'bg-blue-600 ',
        other: 'bg-slate-600',
        nexus: 'bg-indigo-600',
        'local-activity': 'bg-slate-600 ',
        default: 'bg-purple-600 ',
      },
    },
  });

  const timeDot = cva(['h-3 w-3 rounded-full shadow-lg'], {
    variants: {
      category: {
        workflow: 'bg-blue-900 ',
        activity: 'bg-purple-900 ',
        'child-workflow': 'bg-green-900 ',
        timer: 'bg-yellow-900 ',
        signal: 'bg-pink-900 ',
        update: 'bg-blue-900 ',
        other: 'bg-slate-900',
        nexus: 'bg-indigo-900',
        'local-activity': 'bg-slate-900 ',
        default: 'bg-purple-900 ',
      },
    },
  });

  const eventTitle = cva(['p-2 rounded-t-lg'], {
    variants: {
      category: {
        workflow: 'bg-blue-900 ',
        activity: 'bg-purple-900 ',
        'child-workflow': 'bg-green-900 ',
        timer: 'bg-yellow-900 ',
        signal: 'bg-pink-900 ',
        update: 'bg-blue-900 ',
        other: 'bg-slate-900',
        nexus: 'bg-indigo-900',
        'local-activity': 'bg-slate-900 ',
        default: 'bg-purple-900 ',
      },
    },
  });

  const emptyValue = $derived(
    group.isPending ? 'Results will appear upon completion' : 'null',
  );

  $inspect('Group: ', group);
</script>

<div
  class={groupCategory({
    category: group ? group.category : event.category,
  })}
>
  {#if showEventGroup}
    <div class="flex flex-col gap-2 overflow-hidden">
      {@render inputAndResults()}
      {@render eventCards()}
      {@render durationTimes()}
    </div>
  {:else if event}
    <EventCard {event} />
  {/if}
  {@render children?.()}
</div>

{#snippet inputAndResults()}
  <div class="mb-2 flex flex-col gap-2 lg:flex-row">
    {#if group.input !== undefined}
      <div class={'flex w-full flex-col'}>
        <div
          class={eventTitle({
            category: group ? group.category : event.category,
          })}
        >
          <p class="text-base font-medium text-white/90">Input</p>
        </div>
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
    <!-- {#if group.result !== undefined} -->
    <div class="flex w-full flex-col">
      <div
        class={eventTitle({
          category: group ? group.category : event.category,
        })}
      >
        <p class="text-base font-medium text-white/90">Result</p>
      </div>
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
    <!-- {/if} -->
  </div>
{/snippet}

{#snippet eventCards()}
  <div class="flex flex-col gap-1 xl:flex-row">
    {#each group.eventList as groupEvent}
      <EventCard event={groupEvent} />
    {/each}
    {#if group?.pendingActivity}
      <PendingActivityCard activity={group.pendingActivity} />
    {:else if group?.pendingNexusOperation}
      <PendingNexusOperationCard operation={group.pendingNexusOperation} />
    {/if}
  </div>
{/snippet}

{#snippet durationTimes()}
  <div class="flex flex-col gap-1">
    <div>
      <div class="flex flex-row justify-between gap-2 text-xs xl:text-sm">
        {#each group.eventList as event, index}
          <p class="font-mono">
            {formatDate(event.eventTime, $timeFormat, {
              relative: $relativeTime,
            })}
          </p>

          {#if index !== group.eventList.length - 1}
            <p
              class="flex items-center gap-1 rounded bg-slate-900/40 px-1.5 py-0.5 font-mono"
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
          {#each group.eventList as _}
            <div
              class={timeDot({
                category: group ? group.category : event.category,
              })}
            ></div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/snippet}
