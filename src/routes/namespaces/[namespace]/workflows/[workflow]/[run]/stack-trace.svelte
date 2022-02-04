<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page }: LoadInput) {
    const { namespace, workflow: id, run: runId } = page.params;
    const workflow = { id, runId };

    const stackTrace = getWorkflowStackTrace({
      workflow,
      namespace,
    });

    return {
      props: {
        namespace,
        stackTrace,
      },
    };
  }
</script>

<script lang="ts">
  import { faRedo } from '@fortawesome/free-solid-svg-icons';

  import { getWorkflowStackTrace } from '$lib/services/query-service';

  import CodeBlock from '$lib/components/code-block.svelte';
  import Button from '$lib/components/button.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import { getAppContext } from '$lib/utilities/get-context';

  export let namespace: string;
  export let stackTrace: string;

  let workflow = getAppContext('workflow');
  let currentdate = new Date();
  let isLoading = false;

  const refreshStackTrace = async () => {
    isLoading = true;

    stackTrace = await getWorkflowStackTrace({
      workflow: $workflow,
      namespace,
    });

    isLoading = false;
    currentdate = new Date();
  };
</script>

{#await $workflow then workflow}
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
{/await}
