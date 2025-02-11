<script lang="ts">
  import { page } from '$app/stores';

  import TaskQueueTableRow from '$lib/components/deployments/task-queue-table-row.svelte';
  import VersionDetails from '$lib/components/deployments/version-details.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchDeploymentVersion } from '$lib/services/deployments-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import {
    routeForWorkerDeployment,
    routeForWorkerDeployments,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  $: namespace = $page.params.namespace;
  $: deploymentName = $page.params.deployment;
  $: version = $page.params.version;
  $: parameters = {
    namespace,
    deploymentName: decodeURIForSvelte(deploymentName),
    version: decodeURIForSvelte(version),
  };

  $: deploymentVersionFetch = fetchDeploymentVersion(parameters);

  const columns = [
    {
      label: translate('deployments.task-queue-name'),
      pinned: true,
    },
    {
      label: translate('deployments.task-queue-type'),
      pinned: true,
    },
    {
      label: translate('deployments.worker-id'),
      pinned: true,
    },
  ];
</script>

{#await deploymentVersionFetch then versionInfo}
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
        <Link
          href={routeForWorkerDeployment({
            namespace,
            deployment: deploymentName,
          })}
          icon="chevron-left"
        >
          {deploymentName}
        </Link>
        <Icon name="chevron-left" />
        {version}
      </div>
      <div class="flex w-full items-center justify-between">
        <h1>{version}</h1>
        <Button
          href={routeForWorkflowsWithQuery({
            namespace: $page.params.namespace,
            query: `TemporalWorkerDeployment="${deploymentName}"`,
          })}>{translate('deployments.go-to-workflows')}</Button
        >
      </div>
    </div>
    <VersionDetails version={versionInfo.workerDeploymentVersionInfo} />
  </header>
  <div class="bg-primary p-8">
    <PaginatedTable
      aria-label={translate('deployments.deployments')}
      perPageLabel={translate('common.per-page')}
      nextPageButtonLabel={translate('common.next-page')}
      previousPageButtonLabel={translate('common.previous-page')}
      pageButtonLabel={(page) => translate('common.go-to-page', { page })}
      items={versionInfo.workerDeploymentVersionInfo.taskQueueInfos}
      let:visibleItems
    >
      <caption class="sr-only" slot="caption">
        {translate('deployments.deployments')}
      </caption>
      <tr slot="headers" class="text-left">
        {#each columns as { label }}
          <th>{label}</th>
        {/each}
      </tr>
      {#each visibleItems as taskQueue}
        <TaskQueueTableRow {taskQueue} {columns} />
      {/each}
    </PaginatedTable>
  </div>
{/await}
