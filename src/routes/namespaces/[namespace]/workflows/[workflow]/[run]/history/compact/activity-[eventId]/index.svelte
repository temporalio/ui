<script context="module" lang="ts">
  import { routeFor } from '$lib/utilities/route-for';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page }: LoadInput) {
    const {
      workflow: workflowId,
      run: runId,
      namespace,
      eventId,
    } = page.params;

    return {
      status: 302,
      redirect: routeFor('workflow.events.compact.activity.event', {
        namespace,
        workflowId,
        runId,
        eventId,
        activityId: eventId,
      }),
    };
  }
</script>
