<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkerDeployments from '$lib/pages/deployments.svelte';
  import {
    routeForWorkerDeployments,
    routeForWorkers,
  } from '$lib/utilities/route-for';

  const { namespace } = $derived(page.params);

  const workersHref = $derived(routeForWorkers({ namespace }));
  const deploymentsHref = $derived(routeForWorkerDeployments({ namespace }));
</script>

<PageTitle
  title={translate('deployments.worker-deployments')}
  url={page.url.href}
/>
<header class="flex flex-col gap-2">
  <div class="flex flex-wrap items-center gap-2">
    <h1 class="leading-7" data-cy="workers-title">
      {translate('deployments.worker-deployments')}
    </h1>
  </div>
  <Tabs>
    <TabList label={translate('workers.worker-views')}>
      <Tab
        label={translate('workers.workers')}
        id="workers-tab"
        href={workersHref}
        active={false}
      />
      <Tab
        label={translate('deployments.deployments')}
        id="deployments-tab"
        href={deploymentsHref}
        active={true}
      />
    </TabList>
  </Tabs>
</header>

<WorkerDeployments />
