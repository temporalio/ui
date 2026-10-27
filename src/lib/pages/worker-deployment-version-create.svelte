<script lang="ts">
  import {
    type ComputeProviderTemplates,
    type ComputeProviderValue,
  } from '$lib/components/workers/serverless-worker-form/compute-providers';
  import CreateVersionForm from '$lib/components/workers/serverless-worker-form/create-version-form.svelte';
  import { computeRegionsFor } from '$lib/components/workers/serverless-worker-form/multi-region';
  import {
    buildComputeConfigForRegions,
    buildComputeConfigFromForm,
    getInitialComputeProvider,
  } from '$lib/components/workers/serverless-worker-form/shared';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconChevronLeft } from '$lib/io/icon';
  import {
    createWorkerDeploymentVersion,
    deleteWorkerDeploymentVersion,
    fetchDeployment,
    validateWorkerDeploymentVersionComputeConfig,
  } from '$lib/services/deployments-service';
  import type { VersionSummary } from '$lib/types/deployments';
  import {
    type ComputeProviderConfig,
    configuredRegions,
    credentialOverrides,
    deployRegionsFor,
  } from '$lib/utilities/compute-provider-config';
  import { lockComputeProvider } from '$lib/utilities/lock-compute-provider';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    deployment: string;
    onSuccess: () => void;
    templates?: Record<ComputeProviderValue, ComputeProviderTemplates>;
    /**
     * The providers this Namespace may use and the regions it lives in. Two
     * or more regions turn on high availability.
     */
    providerConfig?: ComputeProviderConfig;
  }

  let { namespace, deployment, onSuccess, templates, providerConfig }: Props =
    $props();

  const computeProviders = $derived(providerConfig?.providers);
  const gcpRegions = $derived(deployRegionsFor(providerConfig, 'cloud-run'));
  const credentials = $derived(credentialOverrides(providerConfig));
  const namespaceRegions = $derived(configuredRegions(providerConfig));

  let error = $state<string | undefined>();
  let versions = $state<VersionSummary[]>();
  let lockedProvider = $state<ReturnType<typeof lockComputeProvider>>();
  let loading = $state(true);
  let loadError = $state(false);

  const regions = $derived(
    computeRegionsFor(
      namespaceRegions,
      getInitialComputeProvider({
        provider: lockedProvider?.provider,
        providers: lockedProvider?.providers ?? computeProviders,
      }),
    ),
  );

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
  <Link href={backHref} LeadingIcon={IconChevronLeft}>
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
      {credentials}
      {templates}
      {regions}
      {namespace}
      deploymentName={deployment}
      cancelHref={backHref}
      onSubmit={async (data, regionValues) => {
        error = undefined;
        const computeConfig = regionValues
          ? buildComputeConfigForRegions(regionValues)
          : buildComputeConfigFromForm(data);
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
