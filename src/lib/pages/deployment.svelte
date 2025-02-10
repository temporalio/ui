<script lang="ts">
  import { page } from '$app/stores';

  import DeploymentDetails from '$lib/components/deployments/deployment-details.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchDeployment } from '$lib/services/deployments-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import { routeForWorkerDeployments } from '$lib/utilities/route-for';

  $: namespace = $page.params.namespace;
  $: deploymentName = $page.params.deployment;
  $: parameters = {
    namespace,
    deploymentName: decodeURIForSvelte(deploymentName),
  };

  $: deploymentFetch = fetchDeployment(parameters);
</script>

{#await deploymentFetch}
  <header class="mb-8">
    <div class="relative flex flex-col gap-4">
      <Link href={routeForWorkerDeployments({ namespace })} icon="chevron-left">
        {translate('deployments.back-to-deployments')}
      </Link>
      <h1 class="select-all" data-testid="schedule-name">
        {deploymentName}
      </h1>
    </div>
  </header>
  <Loading />
{:then deployment}
  <header
    class="mb-8 flex flex-row flex-wrap justify-between gap-4 border-b border-subtle"
  >
    <div class="relative flex flex-col gap-4">
      <Link href={routeForWorkerDeployments({ namespace })} icon="chevron-left">
        {translate('deployments.back-to-deployments')}
      </Link>
      <h1 class="relative flex items-center">
        <span class="select-all" data-testid="schedule-name">
          {deploymentName}
        </span>
      </h1>
    </div>
    <DeploymentDetails {deployment} />
    <Tabs>
      <TabList class="flex flex-wrap gap-6 pt-2" label="workflow detail">
        <Tab label="Build IDs" id="build-ids-tab">
          <Badge type="primary" class="px-2 py-0">3</Badge>
        </Tab>
        <Tab label="Task Queues" id="task-queues-tab">
          <Badge type="primary" class="px-2 py-0">2</Badge>
        </Tab>
        <Tab label="Workers" id="workers-tab">
          <Badge type="primary" class="px-2 py-0">1</Badge>
        </Tab>
      </TabList>
    </Tabs>
  </header>
{/await}
