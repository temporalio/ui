<script lang="ts">
  import { fly } from 'svelte/transition';

  import { workflowsSearchParams } from '$lib/stores/workflows';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { eventHistory } from '$lib/stores/events';

  import {
    routeForEventHistory,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  import Copyable from '$lib/components/copyable.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import WorkflowActions from '$lib/components/workflow-actions.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import { isCancelInProgress } from '$lib/utilities/cancel-in-progress';
  import { resetWorkflows } from '$lib/stores/reset-workflows';
  import { has } from '$lib/utilities/has';
  import Link from '$lib/holocene/link.svelte';

  export let namespace: string;

  $: ({ workflow } = $workflowRun);

  $: isRunning = $workflowRun?.workflow?.isRunning;

  $: cancelInProgress = isCancelInProgress(
    $workflowRun?.workflow?.status,
    $eventHistory,
  );

  $: workflowHasBeenReset = has($resetWorkflows, $workflowRun?.workflow.runId);
</script>

<header class="mb-4 flex flex-col gap-1">
  <div class="mb-4 block flex justify-between">
    <a
      href={`${routeForWorkflows({
        namespace,
      })}?${$workflowsSearchParams}`}
      data-testid="back-to-workflows"
      class="back-to-workflows"
    >
      <Icon name="chevron-left" class="inline" />Back to Workflows
    </a>
  </div>
  <div
    class="flex w-full flex-col items-center justify-between gap-4 lg:flex-row"
  >
    <div
      class="flex w-full items-center justify-start gap-4 overflow-hidden whitespace-nowrap lg:w-auto"
    >
      <WorkflowStatus status={workflow?.status} />
      <h1
        data-testid="workflow-id-heading"
        class="overflow-hidden text-2xl font-medium"
      >
        <Copyable
          content={workflow?.id}
          clickAllToCopy
          container-class="w-full"
          class="overflow-hidden text-ellipsis"
        />
      </h1>
    </div>
    {#if isRunning}
      <div
        class="flex flex-col items-center justify-center gap-4 whitespace-nowrap sm:flex-row lg:justify-end"
      >
        <WorkflowActions {cancelInProgress} {workflow} {namespace} />
      </div>
    {/if}
  </div>
  {#if cancelInProgress}
    <div class="mb-4" in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        bold
        icon="info"
        intent="info"
        title="Cancel Request Sent"
        role="status"
      >
        The request to cancel this Workflow Execution has been sent. If the
        Workflow uses the cancellation API, it'll cancel at the next available
        opportunity.
      </Alert>
    </div>
  {/if}
  {#if workflowHasBeenReset}
    <div class="mb-4" in:fly={{ duration: 200, delay: 100 }}>
      <Alert
        bold
        icon="info"
        intent="info"
        data-testid="workflow-reset-alert"
        title="This Workflow has been reset"
        role="status"
      >
        You can find the resulting Workflow Execution <Link
          href={routeForEventHistory({
            namespace,
            workflow: $workflowRun?.workflow?.id,
            run: $resetWorkflows[$workflowRun?.workflow?.runId],
          })}>here</Link
        >.
      </Alert>
    </div>
  {/if}
</header>

<style lang="postcss">
  .back-to-workflows {
    @apply text-sm;
  }

  .back-to-workflows:hover {
    @apply text-blue-700 underline;
  }

  .back-to-workflows:hover :global(svg path) {
    stroke: #1d4ed8;
  }
</style>
