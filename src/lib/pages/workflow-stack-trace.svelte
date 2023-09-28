<script lang="ts">
  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ParsedQuery } from '$lib/services/query-service';
  import { getWorkflowStackTrace } from '$lib/services/query-service';
  import { authUser } from '$lib/stores/auth-user';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { Eventual } from '$lib/types/global';

  const { namespace } = $page.params;
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
    if (workflow?.isRunning) stackTrace = getStackTrace();
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

<section>
  {#if workflow?.isRunning && workers?.pollers?.length > 0}
    {#await stackTrace}
      <div class="text-center">
        <Loading />
        <p>{translate('workflows', 'no-workers-failure-message')}</p>
      </div>
    {:then result}
      <div class="flex items-center gap-4">
        <Button
          on:click={refreshStackTrace}
          leadingIcon="retry"
          loading={isLoading}
        >
          {translate('refresh')}
        </Button>
        <p>
          {translate('workflows', 'stack-trace-at')}
          {currentdate.toLocaleTimeString()}
        </p>
      </div>
      <div class="my-2 flex h-full items-start">
        <CodeBlock
          content={result}
          language="text"
          testId="query-stack-trace"
          copyIconTitle={translate('copy-icon-title')}
          copySuccessIconTitle={translate('copy-success-icon-title')}
        />
      </div>
    {:catch _error}
      <EmptyState
        title={translate('error-occurred')}
        content={translate('workflows', 'no-workers-running-message')}
      />
    {/await}
  {:else}
    <EmptyState
      title={translate('workflows', 'stack-trace-empty-state')}
      testId="query-stack-trace-empty"
    >
      {#if workflow?.isRunning && workers?.pollers?.length === 0}
        <p>
          {translate('workflows', 'stack-trace-link-preface')}<Link
            href="https://docs.temporal.io/workflows#stack-trace-query"
          >
            {translate('workflows', 'stack-trace-link')}</Link
          >{translate('workflows', 'stack-trace-link-postface', {
            taskQueue: workflow?.taskQueue,
          })}
        </p>
      {/if}
    </EmptyState>
  {/if}
</section>
