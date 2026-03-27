<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import Badge from '$lib/holocene/badge.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { pathMatches } from '$lib/utilities/path-matches';
  import {
    routeForWorkerDeployments,
    routeForWorkers,
  } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
    children: Snippet;
  }

  const { children, namespace }: Props = $props();

  const workersHref = $derived(routeForWorkers({ namespace }));
  const deploymentsHref = $derived(routeForWorkerDeployments({ namespace }));
</script>

<header class="flex flex-col gap-2">
  <h1 class="leading-7" data-cy="workers-title">
    {translate('workers.workers')}
  </h1>
  <Tabs>
    <TabList label={translate('workers.worker-views')}>
      <Tab
        label={translate('workers.instance', { count: 2 })}
        id="workers-tab"
        href={workersHref}
        active={pathMatches(
          page.url.pathname,
          routeForWorkers({ namespace }),
          true,
        )}
      >
        <Badge class="shrink-0">Pre-Release</Badge>
      </Tab>
      <Tab
        label={translate('deployments.deployments')}
        id="deployments-tab"
        href={deploymentsHref}
        active={pathMatches(
          page.url.pathname,
          routeForWorkerDeployments({ namespace }),
          true,
        )}
      />
    </TabList>
  </Tabs>
</header>

{@render children()}
