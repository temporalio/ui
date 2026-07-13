<script lang="ts">
  import CreateVersionForm from '$lib/components/workers/serverless-worker-form/create-version-form.svelte';
  import type { ComputeProviderOption } from '$lib/components/workers/serverless-worker-form/shared';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    buildGcpCloudRunComputeConfig,
    buildLambdaComputeConfig,
    createWorkerDeploymentVersion,
    deleteWorkerDeploymentVersion,
    fetchDeployment,
    validateWorkerDeploymentVersionComputeConfig,
  } from '$lib/services/deployments-service';
  import type { VersionSummary } from '$lib/types/deployments';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    deployment: string;
    onSuccess: () => void;
    computeProviders?: readonly ComputeProviderOption[];
    gcpRegions?: string[];
  }

  let {
    namespace,
    deployment,
    onSuccess,
    computeProviders,
    gcpRegions,
  }: Props = $props();

  let error = $state<string | undefined>();
  let versions = $state<VersionSummary[]>();

  const backHref = $derived(
    routeForWorkerDeployment({ namespace, deployment }),
  );

  $effect(() => {
    const controller = new AbortController();
    fetchDeployment(
      { namespace, deploymentName: deployment },
      fetch,
      undefined,
      false,
      controller.signal,
    )
      .then((response) => {
        if (controller.signal.aborted) return;
        versions = response?.workerDeploymentInfo?.versionSummaries ?? [];
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        versions = [];
      });
    return () => controller.abort();
  });
</script>

<div class="flex max-w-[45rem] flex-col gap-4">
  <Link href={backHref} icon="chevron-left">
    {translate('workers.back-to-deployment', { deployment })}
  </Link>
  <h1>
    {translate('workers.create-version-title')}
  </h1>
  <CreateVersionForm
    {error}
    {versions}
    {computeProviders}
    {gcpRegions}
    cancelHref={backHref}
    onSubmit={async (data) => {
      error = undefined;
      const computeConfig =
        data.provider === 'cloud-run'
          ? buildGcpCloudRunComputeConfig(
              data.gcpProject,
              data.gcpRegion,
              data.gcpWorkerPool,
              data.gcpServiceAccount,
            )
          : buildLambdaComputeConfig(data.lambdaArn, data.iamRoleArn, {
              roleExternalId: data.roleExternalId,
              scaleUpCooloffMs: data.scaleUpCooloffMs,
              scaleUpBacklogThreshold: data.scaleUpBacklogThreshold,
              maxWorkerLifetimeMs: data.maxWorkerLifetimeMs,
              metricsPollIntervalMs: data.metricsPollIntervalMs,
            });
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
