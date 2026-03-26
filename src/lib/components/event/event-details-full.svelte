<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { getGroupLLMMetadata } from '$lib/models/event-history/get-event-llm-metadata';
  import type { WorkflowEvent } from '$lib/types/events';

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
</script>

{#if showEventGroup}
  <div class="flex flex-col overflow-hidden">
    {#if llmMetadata}
      <div
        data-testid="group-llm-details"
        class="flex flex-col gap-1 border-b border-subtle bg-interactive-table-hover p-3"
      >
        <p class="text-xs font-medium text-secondary/80">LLM Details</p>
        {#if llmMetadata.model}
          <div class="flex items-center gap-2">
            <p class="min-w-32 text-sm text-secondary/80">Model</p>
            <Badge type="subtle">{llmMetadata.model}</Badge>
          </div>
        {/if}
        {#if llmMetadata.promptTokens}
          <div class="flex items-center gap-2">
            <p class="min-w-32 text-sm text-secondary/80">Prompt tokens</p>
            <p class="text-sm">{llmMetadata.promptTokens.toLocaleString()}</p>
          </div>
        {/if}
        {#if llmMetadata.completionTokens}
          <div class="flex items-center gap-2">
            <p class="min-w-32 text-sm text-secondary/80">Completion tokens</p>
            <p class="text-sm">
              {llmMetadata.completionTokens.toLocaleString()}
            </p>
          </div>
        {/if}
        {#if llmMetadata.totalTokens}
          <div class="flex items-center gap-2">
            <p class="min-w-32 text-sm text-secondary/80">Total tokens</p>
            <p class="text-sm font-medium">
              {llmMetadata.totalTokens.toLocaleString()}
            </p>
          </div>
        {/if}
        {#if llmMetadata.cost}
          <div class="flex items-center gap-2">
            <p class="min-w-32 text-sm text-secondary/80">Cost</p>
            <p class="text-sm font-medium">${llmMetadata.cost.toFixed(4)}</p>
          </div>
        {/if}
        {#if llmMetadata.score != null}
          <div class="flex items-center gap-2">
            <p class="min-w-32 text-sm text-secondary/80">Eval score</p>
            <Badge type={llmMetadata.score >= 0.8 ? 'subtle' : 'warning'}
              >{llmMetadata.score.toFixed(2)}</Badge
            >
          </div>
        {/if}
        {#if llmMetadata.traceUrl}
          <div class="flex items-center gap-2">
            <p class="min-w-32 text-sm text-secondary/80">Trace</p>
            <a
              href={llmMetadata.traceUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-information underline">View in eval tool</a
            >
          </div>
        {/if}
      </div>
    {/if}
    {#if group?.pendingActivity}
      <PendingActivityCard activity={group.pendingActivity} />
    {:else if group?.pendingNexusOperation}
      <PendingNexusOperationCard operation={group.pendingNexusOperation} />
    {/if}
    {#each group.eventList as groupEvent}
      <EventCard event={groupEvent} />
    {/each}
  </div>
{:else if event}
  <EventCard {event} />
{/if}
