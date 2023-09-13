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
      <div class="flex items-start h-full py-2">
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
    <div class="flex items-start h-full py-2">
      <CodeBlock
        content={`coroutine root [blocked on chan-1.Receive]:\ngo.temporal.io/sdk/internal.(*decodeFutureImpl).Get(0xc000cfed20, {0x1e8fc50, 0xc001127620}, {0x1b44a20?, 0xc001042600})\n\t/Users/alex.tideman/go/pkg/mod/go.temporal.io/sdk@v1.17.0/internal/internal_workflow.go:1434 +0x4c\ngithub.com/temporalio/canary.retryActivityWorkflow({0x1e8fc50, 0xc001127620}, 0xc000743da0?, {0x2?, 0x2?})\n\t/Users/alex.tideman/Temporal/canary-go/retry.go:81 +0x365\nreflect.Value.call({0x1b9adc0?, 0x1d7f278?, 0x5000a68?}, {0x1cf7cdc, 0x4}, {0xc001249950, 0x3, 0x203000?})\n\t/usr/local/go/src/reflect/value.go:556 +0x845\nreflect.Value.Call({0x1b9adc0?, 0x1d7f278?, 0x100494c?}, {0xc001249950, 0x3, 0x3})\n\t/usr/local/go/src/reflect/value.go:339 +0xbf\ngo.temporal.io/sdk/internal.executeFunction({0x1b9adc0, 0x1d7f278}, {0xc001127650, 0x3, 0xc000076900?})\n\t/Users/alex.tideman/go/pkg/mod/go.temporal.io/sdk@v1.17.0/internal/internal_worker.go:1651 +0x136\ngo.temporal.io/sdk/internal.(*workflowEnvironmentInterceptor).ExecuteWorkflow(0xc0012497c0, {0x1e8fac8?, 0xc00115b200}, 0xc000cfec48)\n\t/Users/alex.tideman/go/pkg/mod/go.temporal.io/sdk@v1.17.0/internal/workflow.go:504 +0x166\ngo.temporal.io/sdk/internal.(*workflowExecutor).Execute(0xc000d6b740, {0x1e8fac8, 0xc00115b200}, 0x25?)\n\t/Users/alex.tideman/go/pkg/mod/go.temporal.io/sdk@v1.17.0/internal/internal_worker.go:771 +0x292\ngo.temporal.io/sdk/internal.(*syncWorkflowDefinition).Execute.func1({0x1e8fc50, 0xc001127500})\n\t/Users/alex.tideman/go/pkg/mod/go.temporal.io/sdk@v1.17.0/internal/internal_workflow.go:553 +0xcd`}
        language="text"
        testId="query-stack-trace"
        copyIconTitle={translate('copy-icon-title')}
        copySuccessIconTitle={translate('copy-success-icon-title')}
      />
    </div>

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
