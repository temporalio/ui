<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import DeleteDeploymentModal from '$lib/components/deployments/delete-deployment-modal.svelte';
  import DeploymentHeader from '$lib/components/deployments/deployment-header.svelte';
  import RampUnversionedModal from '$lib/components/deployments/ramp-unversioned-modal.svelte';
  import VersionTableRow from '$lib/components/deployments/version-table-row.svelte';
  import Button from '$lib/holocene/button.svelte';
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
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { routeForWorkerDeployments } from '$lib/utilities/route-for';

  interface Props {
    showInstancesLink?: boolean;
  }

  let { showInstancesLink = true }: Props = $props();

  const { namespace } = $derived(page.params);
  const deploymentName = $derived(decodeURIForSvelte(page.params.deployment));

  // fetchDeployment lives here rather than in +page.ts because it requires a
  // server-relative base URL that isn't available at import time for package
  // consumers.
  let lastInvalidatedAt = $state(Date.now());
  const effectiveDeploymentPromise = $derived.by(() => {
    lastInvalidatedAt; // tracked so updating it re-fetches
    return fetchDeployment({ namespace, deploymentName });
  });

  function reload() {
    lastInvalidatedAt = Date.now();
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

  async function handleRemoveRampUnversioned() {
    await removeRampingUnversionedWorkers({ namespace, deploymentName });
    reload();
  }
</script>

{#await effectiveDeploymentPromise}
  <SkeletonTable rows={15} />
{:then deployment}
  {@const info = deployment.workerDeploymentInfo}
  {@const unversionedRampingPercentage =
    !info.routingConfig?.rampingDeploymentVersion &&
    info.routingConfig?.rampingVersionPercentage
      ? info.routingConfig.rampingVersionPercentage
      : null}

  <DeploymentHeader
    {namespace}
    {deploymentName}
    {showInstancesLink}
    onDeleteClick={() => (showDeleteModal = true)}
    onRampToUnversioned={() => {
      rampUnversionedPercentage = unversionedRampingPercentage ?? 0;
      showRampUnversionedModal = true;
    }}
  />

  {#if unversionedRampingPercentage !== null}
    <CapabilityGuard capability="serverScaledDeployments">
      <div
        class="mt-4 flex items-center justify-between rounded border border-warning bg-warning/10 px-4 py-2 text-sm"
      >
        <span>
          {translate('deployments.unversioned-ramping-banner', {
            percentage: unversionedRampingPercentage,
          })}
        </span>
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            on:click={() => {
              rampUnversionedPercentage = unversionedRampingPercentage;
              showRampUnversionedModal = true;
            }}
          >
            {translate('common.edit')}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            on:click={handleRemoveRampUnversioned}
          >
            {translate('common.delete')}
          </Button>
        </div>
      </div>
    </CapabilityGuard>
  {/if}

  <div class="mt-4">
    <PaginatedTable
      aria-label={translate('deployments.deployments')}
      perPageLabel={translate('common.per-page')}
      nextPageButtonLabel={translate('common.next-page')}
      previousPageButtonLabel={translate('common.previous-page')}
      pageButtonLabel={(p) => translate('common.go-to-page', { page: p })}
      items={info.versionSummaries ?? []}
      maxHeight="fit-content"
      let:visibleItems
    >
      <caption class="sr-only" slot="caption">
        {translate('deployments.deployments')}
      </caption>
      <tr slot="headers">
        <th>{translate('deployments.build-id')}</th>
        <th>{translate('deployments.build-status')}</th>
        <CapabilityGuard capability="serverScaledDeployments">
          <th>{translate('deployments.compute')}</th>
        </CapabilityGuard>
        <th>{translate('deployments.deployed')}</th>
        <th>{translate('deployments.actions')}</th>
      </tr>
      {#each visibleItems as version (version.version)}
        <VersionTableRow
          routingConfig={info.routingConfig}
          {version}
          {namespace}
          {deploymentName}
          conflictToken={deployment.conflictToken}
          onChange={reload}
        />
      {/each}
    </PaginatedTable>
  </div>

  {#if deleteError}
    <Error error={deleteError} />
  {/if}

  <DeleteDeploymentModal
    open={showDeleteModal}
    {deploymentName}
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
  />
{:catch error}
  <Error {error} />
{/await}
