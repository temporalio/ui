<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { getGroupLLMMetadata } from '$lib/models/event-history/get-event-llm-metadata';
  import type { WorkflowEvent } from '$lib/types/events';
  import { decodePayload } from '$lib/utilities/decode-payload';

  import PendingActivityCard from '../workflow/pending-activity/pending-activity-card.svelte';
  import PendingNexusOperationCard from '../workflow/pending-nexus-operation/pending-nexus-operation-card.svelte';

  import EventCard from './event-card.svelte';

  let {
    group = undefined,
    event = undefined,
  }: { group?: EventGroup; event?: WorkflowEvent } = $props();

  const pendingEvent = $derived(
    group?.pendingActivity || group?.pendingNexusOperation,
  );
  const showEventGroup = $derived(
    group && (group.eventList.length > 1 || pendingEvent),
  );
  const llmMetadata = $derived(group ? getGroupLLMMetadata(group) : null);

  let showRawEvents = $state(false);

  const decodeFirstPayload = (payloads: unknown): string => {
    if (
      payloads &&
      typeof payloads === 'object' &&
      'payloads' in payloads &&
      Array.isArray((payloads as Record<string, unknown>).payloads)
    ) {
      const arr = (payloads as Record<string, unknown>).payloads as unknown[];
      if (arr.length === 0) return '';
      if (arr.length === 1) {
        const decoded = decodePayload(arr[0]);
        if (typeof decoded === 'string') return decoded;
        if (decoded && typeof decoded === 'object')
          return JSON.stringify(decoded, null, 2);
        return String(decoded ?? '');
      }
      // Multiple arguments - decode all
      const decoded = arr.map((p) => decodePayload(p));
      return JSON.stringify(decoded, null, 2);
    }
    if (typeof payloads === 'string') return payloads;
    if (payloads && typeof payloads === 'object')
      return JSON.stringify(payloads, null, 2);
    return String(payloads ?? '');
  };

  const extractResultText = (result: unknown): string => {
    if (
      result &&
      typeof result === 'object' &&
      'payloads' in result &&
      Array.isArray((result as Record<string, unknown>).payloads)
    ) {
      const decoded = decodePayload(
        (result as Record<string, unknown>).payloads[0],
      );
      if (decoded && typeof decoded === 'object' && 'result' in decoded) {
        return String((decoded as Record<string, unknown>).result);
      }
      if (typeof decoded === 'string') return decoded;
      return JSON.stringify(decoded, null, 2);
    }
    if (result && typeof result === 'object' && 'result' in result) {
      return String((result as Record<string, unknown>).result);
    }
    if (typeof result === 'string') return result;
    return JSON.stringify(result, null, 2);
  };

  const scheduledEvent = $derived(
    group?.eventList.find((e) => e.eventType === 'ActivityTaskScheduled'),
  );
  const completedEvent = $derived(
    group?.eventList.find((e) => e.eventType === 'ActivityTaskCompleted'),
  );
  const activityInput = $derived(
    scheduledEvent?.attributes?.input
      ? decodeFirstPayload(scheduledEvent.attributes.input)
      : '',
  );
  const activityOutput = $derived(
    completedEvent?.attributes?.result
      ? extractResultText(completedEvent.attributes.result)
      : '',
  );
  const activityType = $derived(
    scheduledEvent?.attributes?.activityType?.name ||
      scheduledEvent?.attributes?.activityType ||
      '',
  );
  const attempt = $derived(
    group?.eventList.find((e) => e.eventType === 'ActivityTaskStarted')
      ?.attributes?.attempt,
  );
</script>

{#if showEventGroup}
  <div class="flex flex-col overflow-hidden">
    {#if group?.pendingActivity}
      <PendingActivityCard activity={group.pendingActivity} />
    {:else if group?.pendingNexusOperation}
      <PendingNexusOperationCard operation={group.pendingNexusOperation} />
    {/if}

    <!-- Clean summary view -->
    <div class="flex flex-col gap-3 p-4">
      <!-- Activity info line -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-secondary/50">Activity Type</span>
        <span class="text-sm font-medium">{activityType}</span>
        {#if attempt && attempt > 1}
          <Badge type="warning" class="text-xs">Attempt {attempt}</Badge>
        {/if}
      </div>

      <!-- LLM metadata -->
      {#if llmMetadata}
        <div
          data-testid="group-llm-details"
          class="flex flex-wrap items-center gap-2"
        >
          {#if llmMetadata.model}
            <Badge type="subtle">{llmMetadata.model}</Badge>
          {/if}
          {#if llmMetadata.promptTokens}
            <span class="text-xs text-secondary/60"
              >{llmMetadata.promptTokens.toLocaleString()} prompt</span
            >
          {/if}
          {#if llmMetadata.completionTokens}
            <span class="text-xs text-secondary/60"
              >{llmMetadata.completionTokens.toLocaleString()} completion</span
            >
          {/if}
          {#if llmMetadata.totalTokens}
            <Badge type="subtle"
              >{llmMetadata.totalTokens.toLocaleString()} tokens</Badge
            >
          {/if}
          {#if llmMetadata.cost}
            <Badge type="subtle">${llmMetadata.cost.toFixed(4)}</Badge>
          {/if}
          {#if llmMetadata.score != null}
            <Badge type={llmMetadata.score >= 0.8 ? 'subtle' : 'warning'}
              >Score: {llmMetadata.score.toFixed(2)}</Badge
            >
          {/if}
          {#if llmMetadata.traceUrl}
            <a
              href={llmMetadata.traceUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-information underline">View in eval tool</a
            >
          {/if}
          {#if llmMetadata.extra}
            {#each Object.entries(llmMetadata.extra) as [key, value]}
              <span class="text-xs">
                <span class="text-secondary/50">{key}:</span>
                <span class="text-secondary/80"
                  >{typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}</span
                >
              </span>
            {/each}
          {/if}
        </div>
      {/if}

      <!-- Input -->
      {#if activityInput}
        <div class="flex flex-col gap-1">
          <p class="text-xs font-medium text-secondary/50">Input</p>
          <pre
            class="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-code-block p-3 text-sm">{activityInput}</pre>
        </div>
      {/if}

      <!-- Output -->
      {#if activityOutput}
        <div class="flex flex-col gap-1">
          <p class="text-xs font-medium text-secondary/50">Output</p>
          <pre
            class="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded bg-code-block p-3 text-sm">{activityOutput}</pre>
        </div>
      {/if}

      <!-- Show raw events toggle -->
      <button
        class="flex items-center gap-1 self-start text-sm text-secondary/70 hover:text-secondary"
        onclick={() => (showRawEvents = !showRawEvents)}
      >
        <span
          class="inline-block transition-transform {showRawEvents
            ? 'rotate-90'
            : ''}">&#x25B6;</span
        >
        Raw event details
      </button>
    </div>

    <!-- Raw event cards (hidden by default) -->
    {#if showRawEvents}
      <div class="border-t border-subtle">
        {#each group.eventList as groupEvent}
          <EventCard event={groupEvent} />
        {/each}
      </div>
    {/if}
  </div>
{:else if event}
  <EventCard {event} />
{/if}
