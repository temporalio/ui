<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkerSearchTable from '$lib/components/workers/worker-search-table.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkerDeployments from '$lib/pages/deployments.svelte';
  import { routeForWorkers } from '$lib/utilities/route-for';

  const { namespace } = $derived(page.params);
  const view = $derived(page.url.searchParams.get('view'));
  const isDeploymentsView = $derived(view === 'deployments');

  const workersHref = $derived(routeForWorkers({ namespace }));
  const deploymentsHref = $derived(
    `${routeForWorkers({ namespace })}?view=deployments`,
  );

  const pageTitle = $derived(
    isDeploymentsView
      ? translate('deployments.worker-deployments')
      : translate('workers.workers'),
  );
</script>

<PageTitle title={pageTitle} url={page.url.href} />
<header class="flex flex-col gap-2">
  <div class="flex flex-wrap items-center gap-2">
    <h1 class="leading-7" data-cy="workers-title">
      {pageTitle}
    </h1>
    {#if isDeploymentsView}
      <Badge class="shrink-0">Public Preview</Badge>
    {/if}
  </div>
  <Tabs>
    <TabList label={translate('workers.worker-views')}>
      <Tab
        label={translate('workers.workers')}
        id="workers-tab"
        href={workersHref}
        active={!isDeploymentsView}
      />
      <Tab
        label={translate('deployments.deployments')}
        id="deployments-tab"
        href={deploymentsHref}
        active={isDeploymentsView}
      />
    </TabList>
  </Tabs>
</header>

{#if isDeploymentsView}
  <WorkerDeployments hideHeader />
{:else}
  <WorkerSearchTable {namespace} />
{/if}
