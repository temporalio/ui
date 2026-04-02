<script lang="ts">
  import CreateVersionForm from '$lib/components/workers/serverless-worker-form/create-version-form.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    buildLambdaComputeConfig,
    createWorkerDeploymentVersion,
  } from '$lib/services/deployments-service';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  type Props = {
    namespace: string;
    deployment: string;
    onSuccess: () => void;
  };

  let { namespace, deployment, onSuccess }: Props = $props();

  let error = $state<string | undefined>();

  const backHref = $derived(
    routeForWorkerDeployment({ namespace, deployment }),
  );
</script>

<div class="flex flex-col gap-4">
  <Link href={backHref} icon="chevron-left">
    {translate('workers.back-to-deployment', { deployment })}
  </Link>
  <h1 class="text-2xl font-semibold">
    {translate('workers.create-version-title')}
  </h1>
  <CreateVersionForm
    deploymentName={deployment}
    {error}
    cancelHref={backHref}
    onSubmit={async (data) => {
      error = undefined;
      await createWorkerDeploymentVersion(
        {
          namespace,
          deploymentVersion: {
            deploymentName: deployment,
            buildId: data.buildId,
          },
          computeConfig: buildLambdaComputeConfig(
            data.lambdaArn,
            data.iamRoleArn,
            {
              maxWorkers: data.maxWorkers,
              maxConcurrentActivities: data.maxConcurrentActivities,
              maxTaskQueueRate: data.maxTaskQueueRate,
              idleTimeoutSeconds: data.idleTimeoutSeconds,
            },
          ),
        },
        (err) => {
          error = err.statusText || translate('workers.create-version-error');
        },
      );
      if (!error) await onSuccess();
    }}
  />
</div>
