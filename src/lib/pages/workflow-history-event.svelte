<script lang="ts">
  import { page } from '$app/stores';

  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import { isEvent } from '$lib/models/event-history';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { isNexusOperationScheduledEvent } from '$lib/utilities/is-event-type';

  $: ({
    id: eventId,
    namespace,
    workflow: workflowId,
    run: runId,
  } = $page.params);

  $: ids = [eventId];

  const resetFullHistory = () => {
    $fullEventHistory = [];
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    if (!$fullEventHistory.length) {
      resetFullHistory();
      $fullEventHistory = await fetchAllEvents({
        namespace,
        workflowId,
        runId,
      });
    }
  };

  $: fetchEvents(namespace, workflowId, runId);

  $: ({ workflow } = $workflowRun);
  $: pendingActivities = workflow?.pendingActivities;
  $: pendingNexusOperations = workflow?.pendingNexusOperations;

  $: ascendingGroups = groupEvents(
    $fullEventHistory,
    'ascending',
    pendingActivities,
    pendingNexusOperations,
  );
  $: groups =
    $eventFilterSort === 'ascending'
      ? ascendingGroups
      : [...ascendingGroups].reverse();

  $: initialEvent = $fullEventHistory.find(
    (e) =>
      eventId === e.id ||
      (isNexusOperationScheduledEvent(e) &&
        eventId === e.attributes?.requestId),
  );
  $: visibleItems = $fullEventHistory.filter(
    (e) => ids.includes(e.id) || e.id === initialEvent?.id,
  );
  $: loading = !visibleItems.length;

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
      if (start + i <= $fullEventHistory.length) {
        nextTen.push((start + i).toString());
      }
    }

    ids = [...ids, ...nextTen];
  };

  $: lastEventId = $fullEventHistory[$fullEventHistory.length - 1]?.id;
</script>

<div
  class="flex flex-col gap-2 px-8 pb-24 pt-2"
  data-testid="event-summary-log"
>
  <Button
    variant="secondary"
    size="xs"
    leadingIcon="arrow-up"
    on:click={loadPrevious}
    disabled={ids[0] === '1' || loading}
    data-testid="load-previous">Show Previous 10</Button
  >
  <table>
    <thead></thead>
    <tbody>
      {#each visibleItems as event, index}
        <EventSummaryRow
          {event}
          {index}
          expanded={event.id === initialEvent?.id}
          group={groups.find((g) => isEvent(event) && g.eventIds.has(event.id))}
          initialItem={$fullEventHistory[0]}
        />
      {/each}
    </tbody>
  </table>
  <Button
    variant="secondary"
    size="xs"
    leadingIcon="arrow-down"
    on:click={loadNext}
    disabled={ids[ids.length - 1] === lastEventId || loading}
    data-testid="load-next">Show Next 10</Button
  >
</div>

<style lang="postcss">
  tbody {
    :global(tr:nth-of-type(odd)) {
      @apply surface-primary;
    }

    :global(tr > td) {
      @apply whitespace-nowrap p-2;
    }
  }
</style>
