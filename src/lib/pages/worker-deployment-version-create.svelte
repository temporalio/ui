<script lang="ts">
  import CreateVersionForm from '$lib/components/workers/serverless-worker-form/create-version-form.svelte';
  import type { ComputeProviderOption } from '$lib/components/workers/serverless-worker-form/shared';
  import Alert from '$lib/holocene/alert.svelte';
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
  import { lockComputeProvider } from '$lib/utilities/lock-compute-provider';
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
  let lockedProvider = $state<ReturnType<typeof lockComputeProvider>>();
  let loading = $state(true);
  let loadError = $state(false);

  const backHref = $derived(
    routeForWorkerDeployment({ namespace, deployment }),
  );

  $effect(() => {
    loading = true;
    loadError = false;
    versions = undefined;
    lockedProvider = undefined;

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
        const info = response?.workerDeploymentInfo;
        if (!info) {
          loadError = true;
          return;
        }
        versions = info.versionSummaries ?? [];
        lockedProvider = lockComputeProvider(info, computeProviders);
        loadError = versions.length > 0 && !lockedProvider;
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        loadError = true;
      })
      .finally(() => {
        if (!controller.signal.aborted) loading = false;
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
  {#if loadError}
    <Alert intent="error" title={translate('common.error-occurred')}>
      {translate('common.unknown-error')}
    </Alert>
  {:else if !loading}
    <CreateVersionForm
      {error}
      {versions}
      computeProviders={lockedProvider?.providers ?? computeProviders}
      initialProvider={lockedProvider?.provider}
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
                {
                  minReplicas: data.minReplicas,
                  maxReplicas: data.maxReplicas,
                  initialReplicas: data.initialReplicas,
                  utilizationTarget: data.utilizationTarget,
                },
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
  {/if}
</div>
