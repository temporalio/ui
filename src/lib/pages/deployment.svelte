<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import DeleteDeploymentModal from '$lib/components/deployments/delete-deployment-modal.svelte';
  import DeploymentHeader from '$lib/components/deployments/deployment-header.svelte';
  import RampUnversionedModal from '$lib/components/deployments/ramp-unversioned-modal.svelte';
  import VersionTableRow from '$lib/components/deployments/version-table-row.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Error from '$lib/holocene/error.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    deleteWorkerDeployment,
    fetchDeployment,
    removeRampingUnversionedWorkers,
    setRampingUnversionedWorkers,
  } from '$lib/services/deployments-service';
  import type { DescribeWorkerDeploymentResponse } from '$lib/types/deployments';
  import { deploymentHasComputeConfig } from '$lib/utilities/deployment-has-compute-config';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { routeForWorkerDeployments } from '$lib/utilities/route-for';

  interface Props {
    showInstancesLink?: boolean;
    showConnectionStatus?: boolean;
  }

  let { showInstancesLink = true, showConnectionStatus = true }: Props =
    $props();

  const { namespace } = $derived(page.params);
  const deploymentName = $derived(decodeURIForSvelte(page.params.deployment));

  // fetchDeployment lives here rather than in +page.ts because it requires a
  // server-relative base URL that isn't available at import time for package
  // consumers.
  const deploymentRoute = $derived.by(() => {
    const parameters = { namespace, deploymentName };
    return {
      parameters,
      initialPromise: fetchDeployment(parameters),
    };
  });
  let refreshedDeployment = $state.raw<{
    route: typeof deploymentRoute;
    deployment: DescribeWorkerDeploymentResponse;
  }>();
  let refreshError = $state.raw<{
    route: typeof deploymentRoute;
    error: unknown;
  }>();
  let latestRefresh = 0;

  async function reload() {
    const request = ++latestRefresh;
    const route = deploymentRoute;

    try {
      const deployment = await fetchDeployment(route.parameters);
      if (request !== latestRefresh || route !== deploymentRoute) return;
      refreshedDeployment = { route, deployment };
      refreshError = undefined;
    } catch (error) {
      if (request !== latestRefresh || route !== deploymentRoute) return;
      refreshError = { route, error };
    }
  }

  let showDeleteModal = $state(false);
  let deleteError = $state<string | undefined>();

  async function handleDeleteDeployment(conflictToken: string) {
    deleteError = undefined;
    await deleteWorkerDeployment(
      { namespace, deploymentName, conflictToken },
      () => {
        deleteError = translate('deployments.delete-deployment-confirm-error');
      },
    );
    if (!deleteError) {
      goto(routeForWorkerDeployments({ namespace }));
    }
  }

  let showRampUnversionedModal = $state(false);
  let rampUnversionedPercentage = $state(0);
  let rampUnversionedError = $state('');

  async function handleRampUnversioned(percentage: number) {
    rampUnversionedError = '';
    await setRampingUnversionedWorkers(
      { namespace, deploymentName, percentage },
      (err) => {
        rampUnversionedError =
          (err as { body?: { message?: string } })?.body?.message ??
          translate('deployments.ramp-to-unversioned-error');
      },
    );
    if (rampUnversionedError) return;
    showRampUnversionedModal = false;
    reload();
  }

  async function handleRemoveRampUnversioned(conflictToken?: string) {
    rampUnversionedError = '';
    await removeRampingUnversionedWorkers(
      { namespace, deploymentName, conflictToken },
      (err) => {
        rampUnversionedError =
          (err as { body?: { message?: string } })?.body?.message ??
          translate('deployments.ramp-to-unversioned-error');
      },
    );
    if (rampUnversionedError) return;
    showRampUnversionedModal = false;
    reload();
  }
</script>

{#await deploymentRoute.initialPromise}
  <SkeletonTable rows={15} />
{:then initialDeployment}
  {@const deployment =
    refreshedDeployment?.route === deploymentRoute
      ? refreshedDeployment.deployment
      : initialDeployment}
  {#if refreshError?.route === deploymentRoute}
    <Error error={refreshError.error} />
  {/if}
  {@const info = deployment.workerDeploymentInfo}
  {@const hasComputeConfig = deploymentHasComputeConfig(info)}
  {@const unversionedRampingPercentage =
    !info.routingConfig?.rampingDeploymentVersion &&
    info.routingConfig?.rampingVersionPercentage != null
      ? info.routingConfig.rampingVersionPercentage
      : null}

  <DeploymentHeader
    {namespace}
    {deploymentName}
    {hasComputeConfig}
    {showInstancesLink}
    onDeleteClick={() => (showDeleteModal = true)}
    onRampToUnversioned={() => {
      rampUnversionedPercentage = unversionedRampingPercentage ?? 0;
      showRampUnversionedModal = true;
    }}
  />

  {#if unversionedRampingPercentage !== null}
    <Alert
      intent="warning"
      title={translate('deployments.unversioned-ramping-banner', {
        percentage: unversionedRampingPercentage,
      })}
      class="mt-4"
    />
  {/if}

  <div class="mt-4">
    <PaginatedTable
      aria-label={translate('deployments.deployments')}
      perPageLabel={translate('common.per-page')}
      nextPageButtonLabel={translate('common.next-page')}
      previousPageButtonLabel={translate('common.previous-page')}
      pageButtonLabel={(p) => translate('common.go-to-page', { page: p })}
      items={info.versionSummaries ?? []}
    >
      {#snippet caption()}
        <caption class="sr-only">
          {translate('deployments.deployments')}
        </caption>
      {/snippet}
      {#snippet headers()}
        <tr>
          <th>{translate('deployments.build-id')}</th>
          <th>{translate('deployments.lifecycle')}</th>
          <th>{translate('deployments.compute')}</th>
          {#if showConnectionStatus}
            <th>{translate('deployments.connection')}</th>
          {/if}
          <th>{translate('deployments.deployed')}</th>
          <th>{translate('deployments.actions')}</th>
        </tr>
      {/snippet}
      {#snippet rows({ visibleItems })}
        {#each visibleItems as version (version.version)}
          <VersionTableRow
            routingConfig={info.routingConfig}
            {version}
            {namespace}
            {deploymentName}
            conflictToken={deployment.conflictToken}
            {showConnectionStatus}
            onChange={reload}
            onValidationComplete={reload}
          />
        {/each}
      {/snippet}
    </PaginatedTable>
  </div>

  {#if deleteError}
    <Error error={deleteError} />
  {/if}

  <DeleteDeploymentModal
    open={showDeleteModal}
    {deploymentName}
    hasVersions={!!info.versionSummaries?.length}
    error={deleteError}
    onConfirm={() => handleDeleteDeployment(deployment.conflictToken)}
    onCancel={() => (showDeleteModal = false)}
  />

  <RampUnversionedModal
    open={showRampUnversionedModal}
    bind:percentage={rampUnversionedPercentage}
    error={rampUnversionedError}
    onConfirm={handleRampUnversioned}
    onCancel={() => {
      showRampUnversionedModal = false;
      rampUnversionedError = '';
    }}
    onRemove={unversionedRampingPercentage !== null
      ? () => handleRemoveRampUnversioned(deployment.conflictToken)
      : undefined}
  />
{:catch error}
  <Error {error} />
{/await}
