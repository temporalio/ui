<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

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
  import type { WorkerDeploymentResponse } from '$lib/types/deployments';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { routeForWorkerDeployments } from '$lib/utilities/route-for';

  interface Props {
    deploymentPromise?: Promise<WorkerDeploymentResponse>;
  }

  let { deploymentPromise }: Props = $props();

  const { namespace } = $derived(page.params);
  const deploymentName = $derived(decodeURIForSvelte(page.params.deployment));
  const effectiveDeploymentPromise = $derived(
    deploymentPromise ?? fetchDeployment({ namespace, deploymentName }),
  );

  const columns = [
    { label: translate('deployments.build-id') },
    { label: translate('deployments.build-status') },
    { label: translate('deployments.compute') },
    { label: translate('deployments.deployed') },
    { label: translate('deployments.actions') },
  ];

  let showDeleteModal = $state(false);
  let deleteError = $state<string | undefined>();

  async function handleDeleteDeployment(conflictToken: string) {
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
        {#each columns as { label } (label)}
          <th>{label}</th>
        {/each}
      </tr>
      {#each visibleItems as version (version.version)}
        <VersionTableRow
          routingConfig={info.routingConfig}
          {version}
          {namespace}
          {deploymentName}
          conflictToken={deployment.conflictToken}
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
