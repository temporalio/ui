<script lang="ts">
  import { onMount } from 'svelte';

  import ActivityCommands from '$lib/components/activity/activity-commands.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { IconArrowDown, IconArrowUp } from '$lib/io/icon';
  import { getWorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte.js';
  import { triggerRefresh, workflowRun } from '$lib/stores/workflow-run';
  import type { PendingActivity } from '$lib/types/events';

  interface Props {
    eventId: string;
  }

  const { eventId }: Props = $props();
  const historyController = getWorkflowHistoryController();

  let ids = $derived([eventId]);

  onMount(() => historyController.resume());

  const { workflow } = $derived($workflowRun);
  const initialEvent = $derived(
    historyController.history.event(eventId) ??
      historyController.history.event(
        String(
          workflow?.workflowExtendedInfo?.requestIdInfos?.[eventId]?.eventId,
        ),
      ),
  );

  const visibleItems = $derived(
    [...new Set(initialEvent ? [...ids, initialEvent.id] : ids)]
      .map((id) => historyController.history.event(id))
      .filter((event) => event !== undefined)
      .sort((a, b) => Number(a.id) - Number(b.id)),
  );
  const loading = $derived(historyController.loading && !visibleItems.length);
  const lastEventId = $derived(historyController.latestEventId);

  const loadPrevious = () => {
    const firstId = parseInt(ids[0]);
    const previousTen: string[] = [];
    const start = firstId - 10;

    for (let i = 0; i < 10; i++) {
      if (start + i > 0) {
        previousTen.push((start + i).toString());
      }
    }

    ids = [...previousTen, ...ids];
  };

  const loadNext = () => {
    const lastId = parseInt(ids[ids.length - 1]);
    const nextTen: string[] = [];
    const start = lastId + 1;

    for (let i = 0; i < 10; i++) {
      if (start + i <= lastEventId) {
        nextTen.push((start + i).toString());
      }
    }

    ids = [...ids, ...nextTen];
  };
</script>

{#snippet activityActions(activity: PendingActivity)}
  {#if workflow}
    <ActivityCommands
      {activity}
      workflowExecutionIdentity={historyController.workflowExecutionIdentity}
      {workflow}
      onRefresh={triggerRefresh}
      class="justify-end"
    />
  {/if}
{/snippet}

<div class="flex flex-col gap-2 pb-24" data-testid="event-summary-log">
  <Button
    variant="secondary"
    size="xs"
    LeadingIcon={IconArrowUp}
    onclick={loadPrevious}
    disabled={ids[0] === '1' || loading}
    data-testid="load-previous">Show Previous 10</Button
  >
  <table>
    <thead></thead>
    <tbody>
      {#each visibleItems as event, index (event.id)}
        <EventSummaryRow
          workflowExecutionIdentity={historyController.workflowExecutionIdentity}
          {event}
          {index}
          expanded={event.id === initialEvent?.id}
          group={historyController.history.eventGroup(event.id, {
            excludeWorkflowTasks: true,
          })}
          initialItem={historyController.history.initialEvent}
          {activityActions}
        />
      {/each}
    </tbody>
  </table>
  <Button
    variant="secondary"
    size="xs"
    LeadingIcon={IconArrowDown}
    onclick={loadNext}
    disabled={ids[ids.length - 1] === String(lastEventId) || loading}
    data-testid="load-next">Show Next 10</Button
  >
</div>

<style lang="postcss">
  tbody {
    :global(tr:nth-of-type(odd)) {
      @apply bg-surface-primary text-primary;
    }

    :global(tr > td) {
      @apply whitespace-nowrap p-2;
    }
  }
</style>
