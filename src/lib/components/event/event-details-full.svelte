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
          class="rounded-lg border border-white/10 bg-slate-900 p-3 font-mono"
        >
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              {#if llmMetadata.model}
                <span
                  class="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300"
                  >{llmMetadata.model}</span
                >
              {/if}
              {#if llmMetadata.score != null}
                <span
                  class="rounded px-2 py-0.5 text-xs font-medium {llmMetadata.score >=
                  0.8
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-yellow-500/20 text-yellow-300'}"
                  >score {llmMetadata.score.toFixed(2)}</span
                >
              {/if}
            </div>
            {#if llmMetadata.traceUrl}
              <a
                href={llmMetadata.traceUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-xs text-blue-300 transition-colors hover:bg-white/10 hover:text-blue-200"
              >
                <svg
                  class="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  /></svg
                >
                View Trace
              </a>
            {/if}
          </div>
          <div class="flex flex-wrap gap-2">
            {#if llmMetadata.promptTokens}
              <div class="rounded bg-white/5 px-2 py-1.5">
                <div
                  class="text-[10px] uppercase tracking-wider text-slate-500"
                >
                  Prompt
                </div>
                <div class="text-sm text-slate-200">
                  {llmMetadata.promptTokens.toLocaleString()}
                </div>
              </div>
            {/if}
            {#if llmMetadata.completionTokens}
              <div class="rounded bg-white/5 px-2 py-1.5">
                <div
                  class="text-[10px] uppercase tracking-wider text-slate-500"
                >
                  Completion
                </div>
                <div class="text-sm text-slate-200">
                  {llmMetadata.completionTokens.toLocaleString()}
                </div>
              </div>
            {/if}
            {#if llmMetadata.totalTokens}
              <div class="rounded bg-white/5 px-2 py-1.5">
                <div
                  class="text-[10px] uppercase tracking-wider text-slate-500"
                >
                  Total
                </div>
                <div class="text-sm text-slate-200">
                  {llmMetadata.totalTokens.toLocaleString()}
                </div>
              </div>
            {/if}
            {#if llmMetadata.cost}
              <div class="rounded bg-white/5 px-2 py-1.5">
                <div
                  class="text-[10px] uppercase tracking-wider text-slate-500"
                >
                  Cost
                </div>
                <div class="text-sm text-slate-200">
                  ${llmMetadata.cost.toFixed(4)}
                </div>
              </div>
            {/if}
          </div>
          {#if llmMetadata.extra}
            <div class="mt-2 flex flex-wrap gap-2">
              {#each Object.entries(llmMetadata.extra) as [key, value]}
                <span
                  class="rounded bg-white/5 px-2 py-0.5 text-xs text-slate-400"
                >
                  <span class="text-slate-500">{key}:</span>
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              {/each}
            </div>
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
