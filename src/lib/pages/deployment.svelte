<script lang="ts">
  import { page } from '$app/state';

  import VersionTableRow from '$lib/components/deployments/version-table-row.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import SkeletonTable from '$lib/holocene/skeleton/table.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchDeployment } from '$lib/services/deployments-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import {
    routeForWorkerDeployments,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const deploymentName = $derived(page.params.deployment);
  const parameters = $derived({
    namespace,
    deploymentName: decodeURIForSvelte(deploymentName),
  });
  const workflowHref = $derived(
    routeForWorkflowsWithQuery({
      namespace: page.params.namespace,
      query: `TemporalWorkerDeployment="${deploymentName}"`,
    }),
  );

  const deploymentFetch = $derived(
    fetchDeployment(parameters).then((res) => {
      console.log('Deployment fetch response:', res);
      return res;
    }),
  );

  const columns = [
    { label: translate('deployments.build-id') },
    { label: translate('deployments.status') },
    { label: translate('deployments.deployed') },
    { label: translate('deployments.workflows') },
  ];
</script>

<header
  class="flex flex-row flex-wrap justify-between gap-8 border-b border-subtle px-4 pb-4 pt-8 md:pt-20 xl:px-8"
>
  <div class="relative flex w-full flex-col gap-4">
    <div class="flex items-center gap-2">
      <Link href={routeForWorkerDeployments({ namespace })} icon="chevron-left">
        {translate('deployments.back-to-deployments')}
      </Link>
      <Icon name="chevron-left" />
      {deploymentName}
    </div>
    <div class="flex w-full items-center justify-between">
      <h1>{deploymentName}</h1>
      <Button href={workflowHref}
        >{translate('deployments.go-to-workflows')}</Button
      >
    </div>
  </div>
</header>
<div class="bg-primary p-8">
  {#await deploymentFetch}
    <SkeletonTable rows={15} />
  {:then deployment}
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
      <tr slot="headers">
        {#each columns as { label }}
          <th>{label}</th>
        {/each}
      </tr>
      {#each visibleItems as version}
        <VersionTableRow
          routingConfig={deployment.workerDeploymentInfo.routingConfig}
          {version}
          {columns}
        />
      {/each}
    </PaginatedTable>
  {/await}
</div>
