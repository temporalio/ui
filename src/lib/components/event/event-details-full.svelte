<script lang="ts">
  import { cva } from 'class-variance-authority';
  import type { Snippet } from 'svelte';

  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import PendingActivityCard from '../workflow/pending-activity/pending-activity-card.svelte';
  import PendingNexusOperationCard from '../workflow/pending-nexus-operation/pending-nexus-operation-card.svelte';
  import WorkflowStatus from '../workflow-status.svelte';

  import EventCard from './event-card.svelte';
  import PayloadDecoder from './payload-decoder.svelte';

  let {
    group = undefined,
    event = undefined,
    height = undefined,
    children = undefined,
    headerActions = undefined,
  }: {
    group?: EventGroup;
    event?: WorkflowEvent;
    height?: number;
    children?: Snippet;
    headerActions?: Snippet;
  } = $props();

  const pendingEvent = $derived(
    group?.pendingActivity || group?.pendingNexusOperation,
  );
  const showEventGroup = $derived(group || pendingEvent);

  const groupCategory = cva(['overflow-auto'], {
    variants: {
      category: {
        workflow: 'bg-blue-600 text-white',
        activity: 'bg-purple-600 text-white',
        'child-workflow': 'bg-cyan-600  text-slate-900',
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
    group?.isPending ? 'Results will appear upon completion' : 'null',
  );
  const hasInputOrResult = $derived(
    group?.input !== undefined ||
      group?.category === 'activity' ||
      group?.category === 'nexus',
  );
  const duration = $derived(
    formatDistanceAbbreviated({
      start: group?.initialEvent?.eventTime,
      end: group?.lastEvent?.eventTime,
      includeMilliseconds: true,
    }),
  );
  let status = $derived(group?.finalClassification || group?.classification);
  const showHeader = $derived(group || pendingEvent);

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
  style="{height ? `min-height: ${height - 20}px;` : ''} {!height
    ? 'max-height: 360px;'
    : ''}"
>
  {#if showHeader}
    {@render header()}
  {/if}
  <div class="flex flex-col gap-2" class:p-2={showEventGroup}>
    {@render inputAndResults()}
    {#if showEventGroup}
      {@render eventCards()}
    {/if}
    {#if event && !hasInputOrResult}
      <EventCard {event} class="rounded-t-none" />
    {/if}
    {@render children?.()}
  </div>
</div>

{#snippet header()}
  <div
    class="flex h-full items-center justify-between bg-slate-900/50 text-sm text-white"
  >
    <div
      class="flex h-full w-full flex-row flex-wrap items-start justify-between gap-2 px-2 py-2 text-sm md:items-center md:gap-4"
    >
      <div class="flex items-center gap-2">
        {#if status}
          <WorkflowStatus {status} class="h-6 p-2" />
        {/if}
        {#if group?.pendingActivity?.attempt}
          <div class="flex items-center gap-1">
            <Icon name="retry" />
            {group.pendingActivity.attempt}
          </div>
        {/if}
        <div class="flex flex-wrap">
          {title}
        </div>
      </div>
      {#if duration}
        <Badge type="default" class="flex items-center gap-1 text-xs">
          <Icon name="clock" />
          {duration}
        </Badge>
      {/if}
    </div>
    <div class="flex items-center gap-4">
      {@render headerActions?.()}
    </div>
  </div>
{/snippet}

{#snippet inputAndResults()}
  {#if hasInputOrResult}
    <div class="flex {!height ? 'flex-row' : 'flex-col'} items-start gap-2">
      {#if (group?.category === 'activity' || group?.category === 'nexus') && !group.isPending}
        <div class="flex w-full flex-col">
          <p
            class="rounded-t-lg bg-slate-900/60 px-2 py-1 text-base font-medium text-white"
          >
            Result
          </p>
          <PayloadDecoder value={group?.result} key="payloads">
            {#snippet children(decodedValue)}
              <CodeBlock
                content={decodedValue ?? emptyValue}
                maxHeight={height ? height / 2 : 240}
                copyIconTitle={translate('common.copy-icon-title')}
                copySuccessIconTitle={translate(
                  'common.copy-success-icon-title',
                )}
              />
            {/snippet}
          </PayloadDecoder>
        </div>
      {/if}
      {#if group?.input !== undefined}
        <div class="flex w-full flex-col">
          <p
            class="rounded-t-lg bg-slate-900/60 px-2 py-1 text-base font-medium text-white"
          >
            Input
          </p>
          <PayloadDecoder value={group?.input} key="payloads">
            {#snippet children(decodedValue)}
              <CodeBlock
                content={decodedValue}
                maxHeight={height ? height / 2 : 240}
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
    </div>
  {/if}
{/snippet}

{#snippet eventCards()}
  <div class="flex flex-col gap-1 overflow-hidden text-white xl:flex-row">
    <!-- {#each group.eventList as groupEvent, index}
      <EventCard event={groupEvent} nextEvent={group.eventList[index + 1]} />
    {/each} -->
    {#if group?.pendingActivity}
      <PendingActivityCard activity={group.pendingActivity} />
    {:else if group?.pendingNexusOperation}
      <PendingNexusOperationCard operation={group.pendingNexusOperation} />
    {/if}
  </div>
{/snippet}
