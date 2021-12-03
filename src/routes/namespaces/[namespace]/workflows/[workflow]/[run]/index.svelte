<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export async function load({ stuff, page }: LoadInput) {
    const { workflow, events } = stuff as {
      workflow: WorkflowExecution;
      events: HistoryEvent[];
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
  import CodeBlock from '$lib/components/code-block.svelte';
  import Event from './_event.svelte';

  export let workflow: WorkflowExecution;
  export let events: HistoryEvent[];

  let format: EventFormat = 'grid';

  $: pendingActivities = workflow?.pendingActivities;
</script>

<div class="execution-information px-6 py-6">
  <div class="flex w-full mt-4">
    <PendingActivities activities={pendingActivities} />
  </div>
  <section>
    {#if format === 'grid'}
      <table class="border-collapse w-full border-2 table-fixed">
        <thead>
          <tr>
            <th class="w-1/12">ID</th>
            <th class="w-2/12">Type</th>
            <th class="w-2/12">Time</th>
            <th class="w-7/12">Details</th>
          </tr>
        </thead>
        <tbody>
          {#each events as event, index}
            <Event {event} {index} />
          {/each}
        </tbody>
      </table>
    {/if}

    {#if format === 'json'}
      {#each events as event}
        <CodeBlock heading={`Event ID: ${event.eventId}`} content={event} />
      {/each}
    {/if}
  </section>
</div>
