<script lang="ts">
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';

  import BoxAnimationContainer from './box-animation-container.svelte';

  let {
    namespace,
    id,
    runId,
  }: { namespace: string; id: string; runId?: string } = $props();
  const getWorkflowAndEventHistory = async () => {
    const [workflow, history] = await Promise.all([
      fetchWorkflow({
        namespace,
        workflowId: id,
        runId,
      }),
      fetchAllEvents({
        namespace,
        workflowId: id,
        runId,
        sort: 'ascending',
      }),
    ]);

    return { workflow, history };
  };
</script>

{#await getWorkflowAndEventHistory() then { workflow, history }}
  <BoxAnimationContainer {workflow} {history} />
{:catch error}
  <p>Error loading workflow and history: {error.message}</p>
{/await}
