<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import { getWorkflowStackTrace } from '$lib/services/query-service';
  import type { ParsedQuery } from '$lib/services/query-service';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { authUser } from '$lib/stores/auth-user';

  import Accordion from '$lib/holocene/accordion.svelte';
  import Badge from '$lib/holocene/badge.svelte';

  $: ({ namespace } = $page.params);
  $: ({ workflow, workers } = $workflowRun);

  let currentdate = new Date();
  let isLoading = false;

  const getStackTrace = () =>
    getWorkflowStackTrace(
      {
        workflow,
        namespace,
      },
      $page.data?.settings,
      $authUser?.accessToken,
    );

  let stackTrace: Eventual<ParsedQuery>;
  $: {
    if (workflow.isRunning) stackTrace = getStackTrace();
  }

  const refreshStackTrace = () => {
    stackTrace = getWorkflowStackTrace(
      {
        workflow,
        namespace,
      },
      $page.data?.settings,
      $authUser?.accessToken,
    );

    stackTrace.then(() => {
      currentdate = new Date();
    });
  };
</script>

<Accordion title="Stack Trace" readOnly={!workflow?.isRunning}>
  <p slot="summary">
    {#if !workflow?.isRunning}
      Completed workflow
    {/if}
  </p>
  {#if workflow?.isRunning && workers?.pollers?.length > 0}
    {#await stackTrace}
      <div class="text-center">
        <Loading />
        <p>(This will fail if you have no workers running.)</p>
      </div>
    {:then result}
      <div class="flex items-center gap-4">
        <Button on:click={refreshStackTrace} icon="retry" loading={isLoading}>
          Refresh
        </Button>
        <p>Stack Trace at {currentdate.toLocaleTimeString()}</p>
      </div>
      <div class="flex items-start h-auto">
        <CodeBlock
          content={result}
          language="text"
          testId="query-stack-trace"
        />
      </div>
    {:catch _error}
      <EmptyState
        title="An Error Occured"
        content="Please make sure you have at least one worker running."
      />
    {/await}
  {:else if workflow?.isRunning && workers?.pollers?.length === 0}
    <EmptyState title="No Stack Traces Found" testId="query-stack-trace-empty">
      <p>
        To enable <Link
          href="https://docs.temporal.io/workflows#stack-trace-query"
          >stack traces</Link
        >, run a Worker on the {workflow?.taskQueue} Task Queue.
      </p>
    </EmptyState>
  {/if}
</Accordion>
