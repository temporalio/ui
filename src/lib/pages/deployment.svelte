<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import DeleteDeploymentModal from '$lib/components/deployments/delete-deployment-modal.svelte';
  import DeploymentHeader from '$lib/components/deployments/deployment-header.svelte';
  import VersionTableRow from '$lib/components/deployments/version-table-row.svelte';
  import Error from '$lib/holocene/error.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    deleteWorkerDeployment,
    fetchDeployment,
  } from '$lib/services/deployments-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { routeForWorkerDeployments } from '$lib/utilities/route-for';

  interface Props {
    showInstancesLink?: boolean;
  }

  let { showInstancesLink = true }: Props = $props();

  const { namespace } = $derived(page.params);
  const deploymentName = $derived(decodeURIForSvelte(page.params.deployment));

  // fetchDeployment lives here rather than in +page.ts because the grpc
  // transport requires a server-relative base URL that isn't available at
  // the SvelteKit load layer in cloud-ui. We use a reload counter so
  // child actions (e.g. version delete) can trigger a same-page re-fetch
  // without navigating away.
  let reloadCount = $state(0);
  const effectiveDeploymentPromise = $derived.by(() => {
    reloadCount; // tracked so incrementing it re-fetches
    return fetchDeployment({ namespace, deploymentName });
  });

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
</script>

{#await effectiveDeploymentPromise}
  <SkeletonTable rows={15} />
{:then deployment}
  {@const info = deployment.workerDeploymentInfo}

  <DeploymentHeader
    {namespace}
    {deploymentName}
    hasVersions={!!info.versionSummaries?.length}
    {showInstancesLink}
    onDeleteClick={() => (showDeleteModal = true)}
  />

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
          onVersionDeleted={() => reloadCount++}
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
{:catch error}
  <Error {error} />
{/await}
