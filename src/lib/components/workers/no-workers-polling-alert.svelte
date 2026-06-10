<script lang="ts">
  import { page } from '$app/state';

  import Alert from '$lib/holocene/alert.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchDeployment } from '$lib/services/deployments-service';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { deploymentHasComputeConfig } from '$lib/utilities/deployment-has-compute-config';
  import { isRunningWithNoWorkers } from '$lib/utilities/is-running-with-no-workers';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  const { workflow } = $derived($workflowRun);
  const runningWithNoWorkers = $derived(isRunningWithNoWorkers($workflowRun));
  const namespace = $derived(page.params.namespace);
  const deployment = $derived(
    workflow?.searchAttributes?.indexedFields?.['TemporalWorkerDeployment'],
  );

  let serverlessDeployment = $state(false);
  let deploymentChecked = $state(false);
  let lastCheckedDeployment: string | undefined = undefined;

  $effect(() => {
    if (!runningWithNoWorkers || !deployment) {
      serverlessDeployment = false;
      deploymentChecked = true;
      lastCheckedDeployment = undefined;
      return;
    }

    if (lastCheckedDeployment === deployment) return;
    lastCheckedDeployment = deployment;

    deploymentChecked = false;
    fetchDeployment(
      { namespace, deploymentName: deployment },
      fetch,
      () => {},
      false,
    )
      .then((response) => {
        serverlessDeployment = deploymentHasComputeConfig(
          response?.workerDeploymentInfo,
        );
      })
      .catch(() => {
        serverlessDeployment = false;
      })
      .finally(() => {
        deploymentChecked = true;
      });
  });
</script>

{#if serverlessDeployment && deployment}
  <Alert
    icon="info"
    intent="info"
    title={translate('workflows.workflow-error-no-workers-serverless-title')}
    class="max-w-screen-lg xl:w-2/3"
    hidden={!runningWithNoWorkers}
  >
    {translate('workflows.workflow-error-no-workers-serverless-description', {
      taskQueue: workflow?.taskQueue ?? '',
      deployment,
    })}
    <Link
      href={routeForWorkerDeployment({ namespace, deployment })}
      class="mt-2 flex items-center gap-1"
    >
      {translate('workflows.view-worker-deployment')}
      <Icon name="arrow-right" />
    </Link>
  </Alert>
{:else}
  <Alert
    icon="warning"
    intent="warning"
    title={translate('workflows.workflow-error-no-workers-title')}
    class="max-w-screen-lg xl:w-2/3"
    hidden={!runningWithNoWorkers || !deploymentChecked}
  >
    {translate('workflows.workflow-error-no-workers-description', {
      taskQueue: workflow?.taskQueue ?? '',
    })}
    {translate('workflows.workers-alert-description')}
    <Link
      href="https://docs.temporal.io/develop/worker-performance"
      newTab
      class="mt-2 flex items-center gap-1"
    >
      {translate('workers.troubleshooting-workers-link')}
      <Icon name="arrow-right" />
    </Link>
  </Alert>
{/if}
