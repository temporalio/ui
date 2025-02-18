<script lang="ts">
  import { page } from '$app/stores';

  import Alert from '$lib/holocene/alert.svelte';
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
        <p>{translate('workflows.no-workers-failure-message')}</p>
      </div>
    {:then result}
      <Alert
        intent="info"
        icon="info"
        title={translate('workflows.call-stack-alert')}
        class="mb-4 w-fit"
      />
      <div class="flex items-center gap-4">
        <Button
          on:click={refreshStackTrace}
          leadingIcon="retry"
          loading={isLoading}
        >
          {translate('common.refresh')}
        </Button>
        <p>
          {translate('workflows.call-stack-at')}
          {currentdate.toLocaleTimeString()}
        </p>
      </div>
      <div class="my-2 flex h-full items-start">
        <CodeBlock
          content={result}
          language="text"
          testId="query-call-stack"
          copyIconTitle={translate('common.copy-icon-title')}
          copySuccessIconTitle={translate('common.copy-success-icon-title')}
        />
      </div>
    {:catch _error}
      <EmptyState
        title={translate('common.error-occurred')}
        content={translate('workflows.no-workers-running-message')}
        error={_error?.message}
      />
    {/await}
  {:else}
    <EmptyState
      title={translate('workflows.call-stack-empty-state')}
      testId="query-call-stack-empty"
    >
      {#if workflow?.isRunning && workers?.pollers?.length === 0}
        <p>
          {translate('workflows.call-stack-link-preface')}<Link
            newTab
            href="https://docs.temporal.io/workflows#stack-trace-query"
          >
            {translate('workflows.call-stack-link')}</Link
          >{translate('workflows.call-stack-link-postface', {
            taskQueue: workflow?.taskQueue,
          })}
        </p>
      {/if}
    </EmptyState>
  {/if}
</section>
