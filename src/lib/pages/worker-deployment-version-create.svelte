<script lang="ts">
  import CreateVersionForm from '$lib/components/workers/serverless-worker-form/create-version-form.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    buildLambdaComputeConfig,
    createWorkerDeploymentVersion,
    deleteWorkerDeploymentVersion,
    validateWorkerDeploymentVersionComputeConfig,
  } from '$lib/services/deployments-service';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    deployment: string;
    onSuccess: () => void;
  }

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
      const computeConfig = buildLambdaComputeConfig(
        data.lambdaArn,
        data.iamRoleArn,
        {
          roleExternalId: data.roleExternalId,
          scaleUpCooloffMs: data.scaleUpCooloffMs,
          scaleUpBacklogThreshold: data.scaleUpBacklogThreshold,
          maxWorkerLifetimeMs: data.maxWorkerLifetimeMs,
          scaleUpDispatchRateEpsilon: data.scaleUpDispatchRateEpsilon,
          metricsPollIntervalMs: data.metricsPollIntervalMs,
        },
      );
      await createWorkerDeploymentVersion(
        {
          namespace,
          deploymentVersion: {
            deploymentName: deployment,
            buildId: data.buildId,
          },
          computeConfig,
        },
        (err) => {
          error =
            err.body?.message ||
            err.statusText ||
            translate('workers.create-version-error');
        },
      );
      if (error) return;

      let validateError: string | undefined;
      const validation = await validateWorkerDeploymentVersionComputeConfig(
        {
          namespace,
          deploymentName: deployment,
          buildId: data.buildId,
          computeConfig,
        },
        (err) => {
          if (err.status === 501) return;
          validateError =
            err.body?.message ||
            err.statusText ||
            translate('workers.create-version-error');
        },
      );

      if (!validateError && (!validation || validation.valid !== false)) {
        await onSuccess();
        return;
      }

      const message =
        validation?.message ??
        validateError ??
        translate('workers.create-version-error');

      let rollbackFailed = false;
      await deleteWorkerDeploymentVersion(
        { namespace, deploymentName: deployment, buildId: data.buildId },
        () => {
          rollbackFailed = true;
        },
      );

      error = rollbackFailed
        ? translate('workers.create-version-rollback-failed', { message })
        : message;
    }}
  />
</div>
