<script lang="ts">
  import { page } from '$app/state';

  import Alert from '$lib/holocene/alert.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ParsedQuery } from '$lib/services/query-service';
  import { getWorkflowStackTrace } from '$lib/services/query-service';
  import { authUser } from '$lib/stores/auth-user';
  import { refresh, workflowRun } from '$lib/stores/workflow-run';
  import type { Eventual } from '$lib/types/global';

  let { workflow, workers } = $derived($workflowRun);
  const namespace = $derived(page.params.namespace);
  let stackTrace: Eventual<ParsedQuery> = $state();

  let refreshDate = $derived(new Date($refresh).toLocaleTimeString());

  const getStackTrace = () =>
    getWorkflowStackTrace(
      {
        workflow,
        namespace,
      },
      page.data?.settings,
      $authUser?.accessToken,
    );

  $effect(() => {
    if (workflow?.isRunning) {
      stackTrace = getStackTrace();
    }
  });
</script>

<section>
  {#if workflow?.isRunning && workers?.pollers?.length > 0}
    {#await stackTrace}
      <div class="flex flex-col gap-2">
        <Skeleton class="h-16 w-1/3 rounded-sm" />
        <Skeleton class="h-3 w-32" />
        <Skeleton class="h-48 w-full rounded-sm" />
      </div>
    {:then result}
      <Alert
        intent="info"
        icon="info"
        title={translate('workflows.call-stack-alert')}
        class="mb-4 w-fit"
      />
      <p>
        {translate('workflows.call-stack-at')}
        {refreshDate}
      </p>
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
