<script lang="ts">
  import { goto } from '$app/navigation';

  import DeleteWorkerModal from '$lib/components/workers/delete-worker-modal.svelte';
  import {
    type ComputeProviderTemplates,
    type ComputeProviderValue,
  } from '$lib/components/workers/serverless-worker-form/compute-providers';
  import EditVersionForm from '$lib/components/workers/serverless-worker-form/edit-version-form.svelte';
  import {
    computeRegionsFor,
    scalingGroupSlots,
    scalingGroupsToRemove,
    splitHighAvailabilityGroups,
  } from '$lib/components/workers/serverless-worker-form/multi-region';
  import {
    buildComputeConfigForRegions,
    buildComputeConfigFromForm,
    formValuesFromGroup,
  } from '$lib/components/workers/serverless-worker-form/shared';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconChevronLeft } from '$lib/io/icon';
  import {
    deleteWorkerDeploymentVersion,
    fetchDeploymentVersion,
    updateWorkerDeploymentVersionComputeConfig,
    validateWorkerDeploymentVersionComputeConfig,
  } from '$lib/services/deployments-service';
  import {
    type ComputeProviderConfig,
    configuredRegions,
    deployRegionsFor,
  } from '$lib/utilities/compute-provider-config';
  import { lockProvidersTo } from '$lib/utilities/lock-compute-provider';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    deployment: string;
    buildId: string;
    templates?: Record<ComputeProviderValue, ComputeProviderTemplates>;
    /**
     * The providers this Namespace may use and the regions it lives in. Two
     * or more regions turn on high availability.
     */
    providerConfig?: ComputeProviderConfig;
  }

  let { namespace, deployment, buildId, templates, providerConfig }: Props =
    $props();

  const computeProviders = $derived(providerConfig?.providers);
  const gcpRegions = $derived(deployRegionsFor(providerConfig, 'cloud-run'));
  const namespaceRegions = $derived(configuredRegions(providerConfig));

  const primaryRegionId = $derived(
    namespaceRegions.find(({ role }) => role !== 'replica')?.regionId,
  );
  const replicaRegionId = $derived(
    namespaceRegions.find(({ role }) => role === 'replica')?.regionId,
  );

  let error = $state<string | undefined>();
  let showDeleteModal = $state(false);

  const backHref = $derived(
    routeForWorkerDeployment({ namespace, deployment }),
  );
  const versionFetch = $derived(
    fetchDeploymentVersion({ namespace, deploymentName: deployment, buildId }),
  );
</script>

{#await versionFetch}
  <SkeletonTable rows={6} />
{:then versionResponse}
  {@const info = versionResponse.workerDeploymentVersionInfo}
  <!-- Each role takes the group scoped to its region, then the unscoped one. -->
  {@const groups = splitHighAvailabilityGroups(info.computeConfig, {
    primaryRegionId,
    replicaRegionId,
  })}
  {@const slots = primaryRegionId
    ? scalingGroupSlots(groups, { primaryRegionId, replicaRegionId })
    : undefined}
  {@const primaryValues = formValuesFromGroup(groups.primary?.group)}
  {@const replicaValues = groups.replica
    ? formValuesFromGroup(groups.replica.group)
    : undefined}
  <!-- A Version's provider cannot be changed, so the picker shows only the one
       in use rather than offering alternatives that cannot be applied. A
       Version with compute only in the replica takes the replica's. -->
  {@const configuredProvider =
    primaryValues.provider ?? replicaValues?.provider ?? 'lambda'}
  <div class="flex max-w-[45rem] flex-col gap-4">
    <Link href={backHref} LeadingIcon={IconChevronLeft}>
      {translate('workers.back-to-deployment', { deployment })}
    </Link>
    <h1 class="text-2xl font-semibold">
      {translate('workers.edit-version-title-with-id', { buildId })}
    </h1>
    <EditVersionForm
      {error}
      computeProviders={lockProvidersTo(configuredProvider, computeProviders)}
      {gcpRegions}
      {templates}
      initialData={{ ...primaryValues, provider: configuredProvider }}
      initialReplicaData={replicaValues}
      primaryGroup={slots?.primary}
      replicaGroup={slots?.replica}
      enabledRegionIds={groups.replica && replicaRegionId
        ? [replicaRegionId]
        : []}
      regions={computeRegionsFor(namespaceRegions, configuredProvider)}
      {namespace}
      deploymentName={deployment}
      {buildId}
      cancelHref={backHref}
      onSubmit={async (data, regionValues) => {
        error = undefined;
        const computeConfig = regionValues
          ? buildComputeConfigForRegions(regionValues)
          : buildComputeConfigFromForm(data);
        const removeScalingGroups = scalingGroupsToRemove(
          info.computeConfig,
          computeConfig,
        );
        await updateWorkerDeploymentVersionComputeConfig(
          {
            namespace,
            deploymentName: deployment,
            buildId,
            computeConfig,
            removeScalingGroups,
          },
          (err) => {
            error =
              err.body?.message ||
              err.statusText ||
              translate('workers.update-compute-config-error');
          },
        );
        if (error) return;

        let validateError: string | undefined;
        const validation = await validateWorkerDeploymentVersionComputeConfig(
          {
            namespace,
            deploymentName: deployment,
            buildId,
            computeConfig,
          },
          (err) => {
            if (err.status === 501) return;
            validateError =
              err.body?.message ||
              err.statusText ||
              translate('workers.update-compute-config-error');
          },
        );

        if (validateError) {
          error = validateError;
          return;
        }
        if (validation?.valid === false) {
          error =
            validation.message ??
            translate('workers.update-compute-config-error');
          return;
        }

        await goto(backHref);
      }}
      onDelete={() => {
        showDeleteModal = true;
      }}
    />
  </div>
{:catch err}
  <Alert intent="warning" title={translate('common.error-occurred')}>
    {err?.message ?? translate('common.unknown-error')}
  </Alert>
{/await}

<DeleteWorkerModal
  open={showDeleteModal}
  workerName={buildId}
  onConfirm={async () => {
    showDeleteModal = false;
    error = undefined;
    await deleteWorkerDeploymentVersion(
      { namespace, deploymentName: deployment, buildId },
      (err) => {
        error = err.statusText || translate('workers.delete-version-error');
      },
    );
    if (!error) await goto(backHref);
  }}
  onCancel={() => {
    showDeleteModal = false;
  }}
/>
