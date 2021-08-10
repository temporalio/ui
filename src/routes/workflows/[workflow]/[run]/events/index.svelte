<script context="module" lang="ts">
  import { WorkflowExecutionAPI } from '$lib/services/workflow-execution-service';
  import type { GetWorkflowExecutionHistoryResponse } from '$types/temporal/api/workflowservice/v1/request_response';

  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ fetch, page }: LoadInput) {
    const { workflow: executionId, run: runId } = page.params;

    const { events } = await WorkflowExecutionAPI.getEvents(
      { executionId, runId },
      fetch,
    );

    return {
      props: {
        events,
      },
    };
  }
</script>

<script lang="ts">
  import Events from './_events.svelte';

  export let events: GetWorkflowExecutionHistoryResponse;

  let { history } = events;
</script>

<div class="px-6 py-6">
  <Events {history} />
</div>
