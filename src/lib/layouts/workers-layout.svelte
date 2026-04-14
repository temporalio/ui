<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import Badge from '$lib/holocene/badge.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    routeForWorkerDeployments,
    routeForWorkers,
  } from '$lib/utilities/route-for';

  interface Props {
    children: Snippet;
    headerAction?: Snippet;
    namespace?: string;
    deploymentsHref?: string;
    workersHref?: string;
  }

  const {
    children,
    namespace = '',
    headerAction,
    deploymentsHref: deploymentsHrefProp,
    workersHref: workersHrefProp,
  }: Props = $props();

  const workersHref = $derived(
    workersHrefProp ?? routeForWorkers({ namespace }),
  );
  const deploymentsHref = $derived(
    deploymentsHrefProp ?? routeForWorkerDeployments({ namespace }),
  );
</script>

<header class="flex flex-col gap-2">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <h1 class="leading-7" data-cy="workers-title">
      {translate('workers.workers')}
    </h1>
    {#if headerAction}
      {@render headerAction()}
    {/if}
  </div>
  <Tabs>
    <TabList label={translate('workers.worker-views')}>
      <Tab
        label={translate('workers.instance', { count: 2 })}
        id="workers-tab"
        href={workersHref}
        active={page.url.pathname.endsWith('/workers')}
      >
        <Badge class="shrink-0">Pre-Release</Badge>
      </Tab>
      <Tab
        label={translate('deployments.deployments')}
        id="deployments-tab"
        href={deploymentsHref}
        active={page.url.pathname.endsWith('/deployments')}
      />
    </TabList>
  </Tabs>
</header>

{@render children()}
