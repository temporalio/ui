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
    credentialOverrides,
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
  const credentials = $derived(credentialOverrides(providerConfig));
  const namespaceRegions = $derived(configuredRegions(providerConfig));

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
  <!-- The unscoped group is the primary, and the group scoped to the
       Namespace's replica is the replica. -->
  {@const groups = splitHighAvailabilityGroups(
    info.computeConfig,
    replicaRegionId,
  )}
  {@const primaryValues = formValuesFromGroup(groups.primary?.group)}
  <!-- A Version's provider cannot be changed, so the picker shows only the one
       in use rather than offering alternatives that cannot be applied. -->
  {@const configuredProvider = primaryValues.provider ?? 'lambda'}
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
      {credentials}
      {templates}
      initialData={primaryValues}
      initialReplicaData={groups.replica
        ? formValuesFromGroup(groups.replica.group)
        : undefined}
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
        // Each group keeps its saved name, so an edit updates it in place.
        const computeConfig = regionValues
          ? buildComputeConfigForRegions(
              regionValues.map((entry) => ({
                ...entry,
                name:
                  entry.scoped === false
                    ? groups.primary?.name
                    : groups.replica?.name,
              })),
            )
          : buildComputeConfigFromForm(data);
        // Only the groups this form edits are removed: the replica's, when
        // high availability is turned off. Any other group is left alone.
        const removeScalingGroups = regionValues
          ? [groups.primary?.name, groups.replica?.name].filter(
              (name): name is string =>
                !!name && !(name in (computeConfig.scalingGroups ?? {})),
            )
          : [];
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
