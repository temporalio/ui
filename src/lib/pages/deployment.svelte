<script lang="ts">
  import { page } from '$app/stores';

  import DeploymentDetails from '$lib/components/deployments/deployment-details.svelte';
  import VersionTableRow from '$lib/components/deployments/version-table-row.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchDeployment } from '$lib/services/deployments-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import {
    routeForWorkerDeployments,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  $: namespace = $page.params.namespace;
  $: deploymentName = $page.params.deployment;
  $: parameters = {
    namespace,
    deploymentName: decodeURIForSvelte(deploymentName),
  };

  $: deploymentFetch = fetchDeployment(parameters);

  const columns = [
    { label: translate('deployments.version'), pinned: true },
    {
      label: translate('deployments.status'),
      pinned: true,
    },
    {
      label: translate('deployments.task-queue-name'),
      pinned: true,
    },
    {
      label: translate('deployments.rollout-started'),
      pinned: true,
    },
    {
      label: translate('deployments.rollout-completed'),
      pinned: true,
    },
    {
      label: translate('deployments.rollout-url'),
      pinned: true,
    },
  ];
</script>

{#await deploymentFetch then deployment}}
  <header
    class="flex flex-row flex-wrap justify-between gap-8 border-b border-subtle px-4 pb-4 pt-8 md:pt-20 xl:px-8"
  >
    <div class="relative flex w-full flex-col gap-4">
      <div class="flex items-center gap-2">
        <Link
          href={routeForWorkerDeployments({ namespace })}
          icon="chevron-left"
        >
          {translate('deployments.back-to-deployments')}
        </Link>
        <Icon name="chevron-left" />
        {deploymentName}
      </div>
      <div class="flex w-full items-center justify-between">
        <h1>{deploymentName}</h1>
        <Button
          href={routeForWorkflowsWithQuery({
            namespace: $page.params.namespace,
            query: `TemporalWorkerDeployment="${deploymentName}"`,
          })}>{translate('deployments.go-to-workflows')}</Button
        >
      </div>
    </div>
    <DeploymentDetails {deployment} />
  </header>
  <div class="bg-primary p-8">
    <PaginatedTable
      aria-label={translate('deployments.deployments')}
      perPageLabel={translate('common.per-page')}
      nextPageButtonLabel={translate('common.next-page')}
      previousPageButtonLabel={translate('common.previous-page')}
      pageButtonLabel={(page) => translate('common.go-to-page', { page })}
      items={deployment.workerDeploymentInfo.versionSummaries}
      let:visibleItems
    >
      <caption class="sr-only" slot="caption">
        {translate('deployments.deployments')}
      </caption>

      <div class="flex flex-col gap-4" slot="header">
        <h1>{translate('deployments.worker-deployments')}</h1>
      </div>

      <tr slot="headers" class="text-left">
        {#each columns as { label }}
          <th>{label}</th>
        {/each}
      </tr>

      {#each visibleItems as version}
        <VersionTableRow {version} {columns} />
      {/each}
    </PaginatedTable>
  </div>
{/await}
