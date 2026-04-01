<script lang="ts">
  import { page } from '$app/state';

  import VersionTableRow from '$lib/components/deployments/version-table-row.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Error from '$lib/holocene/error.svelte';
  import Link from '$lib/holocene/link.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchDeployment } from '$lib/services/deployments-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import {
    routeForWorkerDeployments,
    routeForWorkerDeploymentVersionCreate,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  const { namespace } = $derived(page.params);
  const deploymentName = $derived(decodeURIForSvelte(page.params.deployment));
  const workflowHref = $derived(
    routeForWorkflowsWithQuery({
      namespace,
      query: `TemporalWorkerDeployment="${deploymentName}"`,
    }),
  );

  const deploymentFetch = $derived(
    fetchDeployment({ namespace, deploymentName }),
  );

  const columns = [
    { label: translate('deployments.build-id') },
    { label: translate('deployments.status') },
    { label: translate('deployments.compute') },
    { label: translate('deployments.deployed') },
    { label: translate('deployments.actions') },
  ];
</script>

{#await deploymentFetch}
  <SkeletonTable rows={15} />
{:then deployment}
  {@const info = deployment.workerDeploymentInfo}
  {@const currentBuildId =
    info.routingConfig.currentDeploymentVersion?.buildId ??
    info.currentVersionSummary?.deploymentVersion?.buildId}

  <header class="flex flex-col gap-4">
    <div class="flex items-center gap-2 text-sm">
      <Link href={routeForWorkerDeployments({ namespace })} icon="chevron-left">
        {translate('deployments.back-to-deployments')}
      </Link>
      <span class="text-secondary">|</span>
      <Link href={workflowHref}>
        {translate('workers.go-to-workflows')}
      </Link>
    </div>

    <div class="flex w-full items-center justify-between">
      <h1 class="text-2xl font-semibold">{deploymentName}</h1>
      <div class="flex items-center gap-2">
        <Button variant="secondary" href={workflowHref}>
          {translate('deployments.view-workflows')}
        </Button>
        <Button
          href={routeForWorkerDeploymentVersionCreate({
            namespace,
            deployment: deploymentName,
          })}
        >
          {translate('deployments.create-new-version')}
        </Button>
      </div>
    </div>

    <div class="flex flex-wrap gap-x-8 gap-y-1 text-sm">
      <div class="flex gap-2">
        <span class="text-secondary">{translate('workers.created-at')}</span>
        <Timestamp dateTime={info.createTime} />
      </div>
      {#if currentBuildId}
        <div class="flex gap-2">
          <span class="text-secondary">{translate('deployments.build-id')}</span
          >
          <span>{currentBuildId}</span>
        </div>
      {/if}
    </div>
  </header>

  <div class="mt-4">
    <PaginatedTable
      aria-label={translate('deployments.deployments')}
      perPageLabel={translate('common.per-page')}
      nextPageButtonLabel={translate('common.next-page')}
      previousPageButtonLabel={translate('common.previous-page')}
      pageButtonLabel={(p) => translate('common.go-to-page', { page: p })}
      items={info.versionSummaries}
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
          {columns}
        />
      {/each}
    </PaginatedTable>
  </div>
{:catch error}
  <Error {error} />
{/await}
