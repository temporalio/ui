<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconArrowRight, IconInfo, IconWarning } from '$lib/io/icon';
  import { fetchDeployment } from '$lib/services/deployments-service';
  import { deploymentHasComputeConfig } from '$lib/utilities/deployment-has-compute-config';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    taskQueue: string;
    runningWithNoWorkers: boolean;
    deployment?: string;
  }

  let { namespace, taskQueue, runningWithNoWorkers, deployment }: Props =
    $props();

  let serverlessDeployment = $state(false);
  let deploymentChecked = $state(false);

  $effect(() => {
    if (!runningWithNoWorkers || !deployment) {
      serverlessDeployment = false;
      deploymentChecked = true;
      return;
    }

    deploymentChecked = false;
    const controller = new AbortController();

    fetchDeployment(
      { namespace, deploymentName: deployment },
      fetch,
      () => {},
      false,
      controller.signal,
    )
      .then((response) => {
        if (controller.signal.aborted) return;
        serverlessDeployment = deploymentHasComputeConfig(
          response?.workerDeploymentInfo,
        );
        deploymentChecked = true;
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        serverlessDeployment = false;
        deploymentChecked = true;
      });

    return () => controller.abort();
  });
</script>

{#if serverlessDeployment && deployment}
  <Alert
    Icon={IconInfo}
    intent="info"
    title={translate('workflows.workflow-error-no-workers-serverless-title')}
    class="max-w-screen-lg xl:w-2/3"
    hidden={!runningWithNoWorkers}
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
{:else}
  <Alert
    Icon={IconWarning}
    intent="warning"
    title={translate('workflows.workflow-error-no-workers-title')}
    class="max-w-screen-lg xl:w-2/3"
    hidden={!runningWithNoWorkers || !deploymentChecked}
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
