<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import { getWorkflowStackTrace } from '$lib/services/query-service';
  import type { ParsedQuery } from '$lib/services/query-service';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Button from '$holocene/button.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import Link from '$lib/components/link.svelte';

  const { namespace } = $page.params;
  const { workflow, workers } = $workflowRun;

  let currentdate = new Date();
  let isLoading = false;

  const getStackTrace = () =>
    getWorkflowStackTrace({
      workflow,
      namespace,
    });

  let stackTrace: Eventual<ParsedQuery>;
  $: {
    if (workflow.isRunning) stackTrace = getStackTrace();
  }

  const refreshStackTrace = () => {
    stackTrace = getWorkflowStackTrace({
      workflow,
      namespace,
    });

    stackTrace.then(() => {
      currentdate = new Date();
    });
  };
</script>

<PageTitle title={`Stack Trace | ${workflow.id}`} url={$page.url.href} />
<section>
  {#if workflow.isRunning && workers?.pollers?.length > 0}
    {#await stackTrace}
      <div class="text-center">
        <Loading />
        <p>(This will fail if you have no workers running.)</p>
      </div>
    {:then result}
      <div class="flex items-center gap-4">
        <Button
          on:click={refreshStackTrace}
          iconScale={0.8}
          icon="refresh"
          loading={isLoading}
        >
          Refresh
        </Button>
        <p>Stack Trace at {currentdate.toLocaleTimeString()}</p>
      </div>
      <div class="flex items-start h-full">
        <CodeBlock
          content={result}
          language="text"
          dataCy="query-stack-trace"
        />
      </div>
    {:catch _error}
      <EmptyState
        title="An Error Occured"
        content="Please make sure you have at least one worker running."
      />
    {/await}
  {:else}
    <EmptyState title="No Stack Traces Found" dataCy="query-stack-trace-empty">
      {#if workflow.isRunning && workers?.pollers?.length === 0}
        <p>
          To enable <Link
            href="https://docs.temporal.io/concepts/what-is-a-query/#stack-trace-query"
            >stack traces</Link
          >, run a Worker on the {workflow?.taskQueue} Task Queue.
        </p>
      {/if}
    </EmptyState>
  {/if}
</section>
