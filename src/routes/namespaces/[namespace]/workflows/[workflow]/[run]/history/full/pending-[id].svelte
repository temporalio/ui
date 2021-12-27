<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export async function load({ stuff, page }: LoadInput) {
    const { workflow } = stuff as {
      workflow: WorkflowExecution;
    };

    const event = workflow.pendingActivities.find(
      (activity) => activity.activityId === page.params.id,
    );

    return {
      props: {
        event,
      },
    };
  }
</script>

<script lang="ts">
  import EventDetails from '$lib/components/event-details.svelte';

  export let event: PendingActivity;
</script>

<EventDetails attributes={event} />
