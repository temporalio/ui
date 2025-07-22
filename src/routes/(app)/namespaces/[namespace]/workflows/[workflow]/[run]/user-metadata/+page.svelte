<script>
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import WorkflowCurrentDetails from '$lib/components/workflow/metadata/workflow-current-details.svelte';
  import WorkflowSummaryAndDetails from '$lib/components/workflow/metadata/workflow-summary-and-details.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';

  const { workflow } = $derived($workflowRun);
  const pendingActivities = $derived(workflow?.pendingActivities || []);
  const pendingNexusOperations = $derived(
    workflow?.pendingNexusOperations || [],
  );

  const relevantEvents = $derived(
    $fullEventHistory.filter((event) => {
      if (event.userMetadata?.summary || event.userMetadata?.details) {
        return true;
      }

      return false;
    }),
  );

  const eventGroups = $derived(
    groupEvents(
      relevantEvents,
      'ascending',
      pendingActivities,
      pendingNexusOperations,
    ),
  );
</script>

<div class="flex flex-col gap-6 bg-primary lg:flex-row">
  <WorkflowSummaryAndDetails />
  <WorkflowCurrentDetails />
</div>

{#if relevantEvents.length > 0}
  <div class="border-t border-subtle">
    <div class="px-6 py-4">
      <h3 class="mb-4 text-lg font-semibold">
        {translate('workflows.related-events')}
      </h3>
      <EventSummaryTable
        items={relevantEvents}
        groups={eventGroups}
        compact={false}
        minimized={true}
      />
    </div>
  </div>
{/if}
