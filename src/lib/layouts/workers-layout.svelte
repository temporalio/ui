<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import CountRefreshButton from '$lib/components/count-refresh-button.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { refresh } from '$lib/stores/workers';
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

  let refreshTime = $state(new Date());

  const refreshTimeFormatted = $derived($timestamp(refreshTime));

  $effect(() => {
    void $refresh;
    refreshTime = new Date();
  });
</script>

<header class="flex flex-col gap-2">
  <div class="flex min-h-10 flex-wrap items-center justify-between gap-2">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="leading-7" data-cy="workers-title">
          {translate('workers.workers')}
        </h1>
        <!-- TODO: Add count when there is a WorkersCount API available -->
        <CountRefreshButton count={0} {refresh} />
      </div>
      <p class="mt-2 text-xs text-secondary">
        {refreshTimeFormatted}
      </p>
    </div>
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
      ></Tab>
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
