<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export async function load({ stuff, page }: LoadInput) {
    const { workflow, events } = stuff as {
      workflow: WorkflowExecution;
      events: HistoryEventWithId[];
    };
    const { namespace } = page.params;

    return {
      props: {
        workflow,
        events,
        namespace,
      },
    };
  }
</script>

<script lang="ts">
  import PendingActivities from './_pending-activities.svelte';
  import Event from './_event.svelte';

  export let workflow: WorkflowExecution;
  export let events: HistoryEventWithId[];

  let pendingActivities = workflow?.pendingActivities;
</script>

<div class="execution-information px-6 py-6">
  <div class="flex w-full mt-4">
    <PendingActivities activities={pendingActivities} />
  </div>
  <section>
    <h3 class="text-lg mb-2 font-semibold">Event History</h3>
    {#each events as event}
      <Event {event} />
    {/each}
  </section>
</div>
