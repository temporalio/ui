<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { encodeURISegments } from '$lib/utilities/encode-uri-segments';

  export async function load({ fetch, page }: LoadInput) {
    const { workflow: id, run } = page.params;

    // TODO: Make these concurrent. This can wait until we implement the Redux store.
    const workflowResponse = await fetch(
      encodeURISegments(`/api/workflows/${id}/${run}`),
    );

    const historyResponse = await fetch(
      encodeURISegments(
        `/api/workflows/${id}/${run}/history?waitForHistory=true`,
      ),
    );

    if (!workflowResponse.ok) {
      const message = `An error has occured: ${workflowResponse.status}`;
      throw new Error(message);
    }

    if (!historyResponse.ok) {
      const message = `An error has occured: ${historyResponse.status}`;
      throw new Error(message);
    }

    const { workflowExecutionInfo: workflow } = await workflowResponse.json();
    const { history } = await historyResponse.json();

    const { type, execution } = workflow;
    const { events } = history;

    const { name } = type;
    const { workflowId, runId } = execution;

    const { details: lastEventDetails } = events[events.length - 1];
    const input = lastEventDetails.input && lastEventDetails.input.payloads;
    const result = lastEventDetails.result && lastEventDetails.result.payloads;

    return {
      props: {
        workflow,
        name,
        workflowId,
        runId,
        events,
        input,
        result,
        workflowUrl: encodeURISegments(`/workflows/${workflowId}/${runId}`),
      },
    };
  }
</script>

<script lang="ts">
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  import { formatDate } from '$lib/utilities/format-date';

  export let workflow: WorkflowExecutionAPIResponse;
  export let name: string;
  export let workflowId: string;
  export let runId: string;
  export let events: any[];
  export let input: string;
  export let result: string;
  export let workflowUrl: string;
</script>

<section class="flex items-start">
  <a href={workflowUrl}><button>Contract</button></a>
</section>
