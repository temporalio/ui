<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params, stuff }) {
    const { namespace } = params;
    const { workflow } = stuff;

    const stackTrace = await getWorkflowStackTrace({
      workflow,
      namespace,
    });

    return {
      props: {
        workflow,
        namespace,
        stackTrace,
      },
    };
  };
</script>

<script lang="ts">
  import { faRedo } from '@fortawesome/free-solid-svg-icons';

  import { getWorkflowStackTrace } from '$lib/services/query-service';

  import CodeBlock from '$lib/components/code-block.svelte';
  import Button from '$lib/components/button.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  export let namespace: string;
  export let stackTrace: string;
  export let workflow: WorkflowExecution;

  let currentdate = new Date();
  let isLoading = false;

  const refreshStackTrace = async () => {
    isLoading = true;

    stackTrace = await getWorkflowStackTrace({
      workflow,
      namespace,
    });

    isLoading = false;
    currentdate = new Date();
  };
</script>

<section>
  {#if String(workflow.status) === 'Running'}
    <div class="flex items-center gap-4">
      <Button on:click={refreshStackTrace} icon={faRedo} loading={isLoading}>
        Refresh
      </Button>
      <p>Stack Trace at {currentdate.toLocaleTimeString()}</p>
    </div>
    {#await stackTrace then result}
      <div class="flex items-start h-full">
        <CodeBlock content={result} language="text" />
      </div>
    {/await}
  {:else}
    <EmptyState title="No Stack Traces Found" />
  {/if}
</section>
