<script lang="ts">
  import { cva } from 'class-variance-authority';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';
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
  }: { group?: EventGroup; event?: WorkflowEvent } = $props();

  const workflow = $derived($workflowRun.workflow);
  const pendingEvent = $derived(
    group?.pendingActivity || group?.pendingNexusOperation,
  );
  const showEventGroup = $derived(
    group && (group.eventList.length > 1 || pendingEvent),
  );
  const isRunning = $derived(workflow.isRunning);

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
        workflow: 'bg-blue-700 ',
        activity: 'bg-purple-700 ',
        'child-workflow': 'bg-green-700 ',
        timer: 'bg-yellow-700 ',
        signal: 'bg-pink-700 ',
        update: 'bg-blue-700 ',
        other: 'bg-slate-700',
        nexus: 'bg-indigo-700',
        'local-activity': 'bg-slate-700 ',
        default: 'bg-purple-700 ',
      },
    },
  });

  const timeDot = cva(['h-3 w-3 rounded-full'], {
    variants: {
      category: {
        workflow: 'bg-blue-300 ',
        activity: 'bg-purple-300 ',
        'child-workflow': 'bg-green-300 ',
        timer: 'bg-yellow-300 ',
        signal: 'bg-pink-300 ',
        update: 'bg-blue-300 ',
        other: 'bg-slate-300',
        nexus: 'bg-indigo-300',
        'local-activity': 'bg-slate-300 ',
        default: 'bg-purple-300 ',
      },
    },
  });
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
</div>

{#snippet inputAndResults()}
  <div class="flex flex-col gap-2 lg:flex-row">
    {#if group.input !== undefined}
      <div class="flex w-full flex-col gap-1">
        <h4 class="text-white/90">Input</h4>
        <PayloadDecoder value={group?.input} key="payloads">
          {#snippet children(decodedValue)}
            <CodeBlock
              content={decodedValue}
              maxHeight={384}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          {/snippet}
        </PayloadDecoder>
      </div>
    {/if}
    <!-- {#if group.result !== undefined} -->
    <div class="flex w-full flex-col gap-1">
      <h4 class="text-white/90">Result</h4>
      <PayloadDecoder value={group?.result} key="payloads">
        {#snippet children(decodedValue)}
          <CodeBlock
            content={decodedValue || isRunning
              ? 'Results will appear upon completion'
              : 'null'}
            maxHeight={384}
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
  <div class="my-2 flex flex-col gap-1">
    <div>
      <div class="w-full border-t-2 border-white"></div>
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
    <div class="flex flex-row justify-between gap-2 text-xs xl:text-sm">
      {#each group.eventList as event, index}
        <p class="font-mono">
          {formatDate(event.eventTime, $timeFormat, {
            relative: $relativeTime,
          })}
        </p>

        {#if index !== group.eventList.length - 1}
          <p
            class="flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 font-mono"
          >
            <Icon name="clock" />
            {durationBetweenEvents(
              group?.eventList[index],
              group?.eventList[index + 1],
            )}
          </p>
        {/if}
      {/each}
    </div>
  </div>
{/snippet}
