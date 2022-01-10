<script lang="ts">
  import { getContext } from 'svelte';
  import { faRedo } from '@fortawesome/free-solid-svg-icons';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { namespace } from '$lib/stores/namespace';
  import { getWorkflowStackTrace } from '$lib/services/query-service';

  import CodeBlock from '$lib/components/code-block.svelte';
  import Button from '$lib/components/button.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  let workflow = getContext<PromiseLike<WorkflowExecution>>('workflow');
  let currentdate = new Date();
  let isLoading = true;

  const refreshStackTrace = async (): Promise<string> => {
    isLoading = true;

    const response = await getWorkflowStackTrace({
      workflow,
      namespace: $namespace,
    });

    isLoading = false;
    currentdate = new Date();
    return response;
  };

  let data = refreshStackTrace();
</script>

{#await workflow then workflow}
  <section>
    {#if String(workflow.status) === 'Running'}
      <div class="flex items-center gap-4">
        <Button on:click={refreshStackTrace} icon={faRedo} loading={isLoading}>
          Refresh
        </Button>
        <p>Stack Trace at {currentdate.toLocaleTimeString()}</p>
      </div>
      {#await data then result}
        <div class="flex items-start h-full">
          <CodeBlock content={result} language="text" />
        </div>
      {/await}
    {:else}
      <EmptyState title="No Stack Traces Found" />
    {/if}
  </section>
{/await}
