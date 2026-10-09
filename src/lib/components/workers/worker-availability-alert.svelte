<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconArrowRight, IconInfo, IconWarning } from '$lib/io/icon';
  import { getWorkerAvailabilityState } from '$lib/runes/worker-availability.svelte';
  import type { TaskQueueResponse } from '$lib/types';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    taskQueue: string;
    waiting: boolean;
    workers: TaskQueueResponse | undefined;
    deployment: string | undefined;
  }

  let { namespace, taskQueue, waiting, workers, deployment }: Props = $props();

  const availability = getWorkerAvailabilityState(() => ({
    namespace,
    waiting,
    workers,
    deployment,
  }));
</script>

{#if availability.current.state === 'serverless-idle'}
  {@const { deployment } = availability.current}
  <Alert
    Icon={IconInfo}
    intent="info"
    title={translate('workflows.workflow-error-no-workers-serverless-title')}
    class="max-w-screen-lg xl:w-2/3"
  >
    {translate('workflows.workflow-error-no-workers-serverless-description', {
      taskQueue,
      deployment,
    })}
    <Link
      href={routeForWorkerDeployment({ namespace, deployment })}
      class="mt-2 flex items-center gap-1"
    >
      {translate('workflows.view-worker-deployment')}
      <IconArrowRight />
    </Link>
  </Alert>
{:else if availability.current.state === 'no-workers'}
  <Alert
    Icon={IconWarning}
    intent="warning"
    title={translate('workflows.workflow-error-no-workers-title')}
    class="max-w-screen-lg xl:w-2/3"
  >
    {translate('workflows.workflow-error-no-workers-description', {
      taskQueue,
    })}
    {translate('workflows.workers-alert-description')}
    <Link
      href="https://docs.temporal.io/develop/worker-performance"
      newTab
      class="mt-2 flex items-center gap-1"
    >
      {translate('workers.troubleshooting-workers-link')}
      <IconArrowRight />
    </Link>
  </Alert>
{/if}
