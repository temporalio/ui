<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getWorkerAvailabilityState } from '$lib/runes/worker-availability.svelte';
  import type { TaskQueueResponse } from '$lib/types';
  import { getWorkerDeploymentName } from '$lib/utilities/get-worker-deployment-name';
  import { pluralize } from '$lib/utilities/pluralize';
  import {
    routeForTaskQueue,
    routeForWorkerDeployment,
  } from '$lib/utilities/route-for';
  import { countPollers } from '$lib/utilities/worker-availability';

  interface Props {
    namespace: string;
    taskQueue: string;
    workers: TaskQueueResponse | undefined;
  }

  let { namespace, taskQueue, workers }: Props = $props();

  const availability = getWorkerAvailabilityState(() => ({
    namespace,
    waiting: true,
    workers,
    deployment: getWorkerDeploymentName(workers, null),
  }));

  const workerCount = $derived(countPollers(workers));
</script>

{#snippet taskQueueLink()}
  <Link href={routeForTaskQueue({ namespace, queue: taskQueue })} newTab>
    {translate('workers.view-task-queue')}
  </Link>
{/snippet}

{#if availability.current.state === 'polling'}
  <Alert intent="success" title={translate('workers.task-queue-active')}>
    <div class="flex w-full items-center justify-between">
      <p>{workerCount} {pluralize('Worker', workerCount)}</p>
      {@render taskQueueLink()}
    </div>
  </Alert>
{:else if availability.current.state === 'serverless-idle'}
  {@const { deployment } = availability.current}
  <Alert intent="info" title={translate('workers.task-queue-serverless-title')}>
    <p>
      {translate('workers.task-queue-serverless-description', {
        taskQueue,
        deployment,
      })}
    </p>
    <div class="mt-2 flex w-full items-center justify-between">
      <Link href={routeForWorkerDeployment({ namespace, deployment })}>
        {translate('workflows.view-worker-deployment')}
      </Link>
      {@render taskQueueLink()}
    </div>
  </Alert>
{:else if availability.current.state === 'no-workers'}
  <Alert intent="warning" title={translate('workers.task-queue-inactive')}>
    <div class="flex w-full items-center justify-between">
      <p>0 {pluralize('Worker', 0)}</p>
      {@render taskQueueLink()}
    </div>
  </Alert>
{/if}
