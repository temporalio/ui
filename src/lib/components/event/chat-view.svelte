<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { getGroupLLMMetadata } from '$lib/models/event-history/get-event-llm-metadata';
  import type { IterableEvent } from '$lib/types/events';
  import { decodePayload } from '$lib/utilities/decode-payload';

  let { items }: { items: IterableEvent[] } = $props();

  const TRUNCATE_LIMIT = 500;

  type ActivityStep = {
    activityName: string;
    input: string;
    output: string;
    model?: string;
    totalTokens?: number;
    cost?: number;
    isLLM: boolean;
    timestamp: string;
  };

  const decodeFirstPayload = (payloads: unknown): string => {
    if (
      payloads &&
      typeof payloads === 'object' &&
      'payloads' in payloads &&
      Array.isArray((payloads as Record<string, unknown>).payloads)
    ) {
      const arr = (payloads as Record<string, unknown>).payloads as unknown[];
      if (arr.length > 0) {
        const decoded = decodePayload(arr[0]);
        if (typeof decoded === 'string') return decoded;
        if (decoded && typeof decoded === 'object')
          return JSON.stringify(decoded, null, 2);
      }
    }
    if (typeof payloads === 'string') return payloads;
    if (payloads && typeof payloads === 'object')
      return JSON.stringify(payloads, null, 2);
    return String(payloads ?? '');
  };

  const extractResultText = (result: unknown): string => {
    let decoded: unknown = result;
    if (
      result &&
      typeof result === 'object' &&
      'payloads' in result &&
      Array.isArray((result as Record<string, unknown>).payloads)
    ) {
      decoded = decodePayload((result as Record<string, unknown>).payloads[0]);
    }

    if (decoded && typeof decoded === 'object') {
      const obj = decoded as Record<string, unknown>;
      // Prefer _details.response for chat display
      if (obj._details && typeof obj._details === 'object') {
        const details = obj._details as Record<string, unknown>;
        if (typeof details.response === 'string') return details.response;
      }
      // Fall back to result field
      if ('result' in obj) return String(obj.result);
      return JSON.stringify(decoded, null, 2);
    }
    if (typeof decoded === 'string') return decoded;
    return JSON.stringify(decoded, null, 2);
  };

  const extractStep = (item: IterableEvent): ActivityStep | null => {
    if (!isEventGroup(item)) return null;

    const group = item as EventGroup;
    const llmMetadata = getGroupLLMMetadata(group);
    const activityName = group.displayName || group.name || group.label;

    const scheduledEvent = group.eventList.find(
      (e) => e.eventType === 'ActivityTaskScheduled',
    );
    const completedEvent = group.eventList.find(
      (e) => e.eventType === 'ActivityTaskCompleted',
    );

    const input = scheduledEvent?.attributes?.input
      ? decodeFirstPayload(scheduledEvent.attributes.input)
      : '';
    const output = completedEvent?.attributes?.result
      ? extractResultText(completedEvent.attributes.result)
      : '';

    return {
      activityName,
      input,
      output,
      model: llmMetadata?.model,
      totalTokens: llmMetadata?.totalTokens,
      cost: llmMetadata?.cost,
      isLLM: !!llmMetadata,
      timestamp: completedEvent?.eventTime || completedEvent?.timestamp || '',
    };
  };

  const steps = $derived(
    items
      .filter(isEventGroup)
      .map(extractStep)
      .filter((s): s is ActivityStep => s !== null),
  );

  // Track expanded state per step
  let expandedInputs: Record<number, boolean> = $state({});
  let expandedOutputs: Record<number, boolean> = $state({});
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-4 p-4" data-testid="chat-view">
  {#if steps.length === 0}
    <p class="py-8 text-center text-sm text-secondary">
      No activity steps found in this workflow.
    </p>
  {:else}
    {#each steps as step, i}
      {#if step.isLLM}
        <div class="flex flex-col gap-2">
          <!-- Activity header -->
          <div class="flex items-center gap-2 px-1">
            <span class="text-xs font-medium text-secondary/60"
              >{step.activityName}</span
            >
            {#if step.model}
              <Badge type="subtle" class="text-xs">{step.model}</Badge>
            {/if}
            {#if step.totalTokens}
              <span class="text-xs text-secondary/40"
                >{step.totalTokens.toLocaleString()} tokens</span
              >
            {/if}
            {#if step.cost}
              <span class="text-xs text-secondary/40"
                >${step.cost.toFixed(4)}</span
              >
            {/if}
          </div>

          <!-- Input bubble - right aligned -->
          {#if step.input}
            <div class="flex justify-end">
              <div
                class="max-w-[85%] rounded-2xl rounded-br-sm bg-interactive-secondary-active px-4 py-2.5"
              >
                <p class="text-xs font-medium text-secondary/40">Input</p>
                {#if step.input.length > TRUNCATE_LIMIT && !expandedInputs[i]}
                  <pre
                    class="mt-1 whitespace-pre-wrap break-words text-sm">{step.input.slice(
                      0,
                      TRUNCATE_LIMIT,
                    )}...</pre>
                  <button
                    class="mt-1 text-xs font-medium text-information hover:underline"
                    onclick={() => (expandedInputs[i] = true)}
                  >
                    Show more
                  </button>
                {:else}
                  <pre
                    class="mt-1 whitespace-pre-wrap break-words text-sm">{step.input}</pre>
                  {#if step.input.length > TRUNCATE_LIMIT}
                    <button
                      class="mt-1 text-xs font-medium text-information hover:underline"
                      onclick={() => (expandedInputs[i] = false)}
                    >
                      Show less
                    </button>
                  {/if}
                {/if}
              </div>
            </div>
          {/if}

          <!-- Output bubble - left aligned -->
          {#if step.output}
            <div class="flex justify-start">
              <div
                class="bg-surface-primary max-w-[85%] rounded-2xl rounded-bl-sm border border-subtle px-4 py-2.5"
              >
                <p class="text-xs font-medium text-secondary/40">Output</p>
                {#if step.output.length > TRUNCATE_LIMIT && !expandedOutputs[i]}
                  <pre
                    class="mt-1 whitespace-pre-wrap break-words text-sm">{step.output.slice(
                      0,
                      TRUNCATE_LIMIT,
                    )}...</pre>
                  <button
                    class="mt-1 text-xs font-medium text-information hover:underline"
                    onclick={() => (expandedOutputs[i] = true)}
                  >
                    Show more
                  </button>
                {:else}
                  <pre
                    class="mt-1 whitespace-pre-wrap break-words text-sm">{step.output}</pre>
                  {#if step.output.length > TRUNCATE_LIMIT}
                    <button
                      class="mt-1 text-xs font-medium text-information hover:underline"
                      onclick={() => (expandedOutputs[i] = false)}
                    >
                      Show less
                    </button>
                  {/if}
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Non-LLM activity: compact system-style message -->
        <div class="flex justify-center">
          <div
            class="flex items-center gap-2 rounded-full bg-interactive-table-hover px-3 py-1"
          >
            <span class="text-xs text-secondary/60">{step.activityName}</span>
            {#if step.output}
              <span class="max-w-xs truncate text-xs text-secondary/40"
                >{step.output}</span
              >
            {/if}
          </div>
        </div>
      {/if}
    {/each}
  {/if}
</div>
