<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import CountRefreshButton from '$lib/components/count-refresh-button.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';
  import { createCountPoller } from '$lib/runes/count-poller.svelte';
  import { fetchWorkerCount } from '$lib/services/worker-service';
  import {
    refresh,
    workerCount,
    workerCountEnabled,
  } from '$lib/stores/workers';
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

  const query = $derived(page.url.searchParams.get('query') ?? '');
  const workerHeartbeatsEnabled = $derived(
    !!page.data?.namespace?.namespaceInfo?.capabilities?.workerHeartbeats,
  );
  const countEnabled = $derived(workerHeartbeatsEnabled && $workerCountEnabled);

  const countPoller = createCountPoller({
    getStore: () => workerCount,
    fetch: ({ signal }) =>
      countEnabled
        ? fetchWorkerCount({ namespace, query }, (input, init) =>
            fetch(input, { ...init, signal }),
          )
        : Promise.resolve({ count: 0 }),
    transform: (response) => response.count,
    disabled: () => !countEnabled,
    watch() {
      void namespace;
      void query;
      void countEnabled;
      void $refresh;
    },
  });

  const refreshTime = $derived(new Date(countPoller.refreshTime));

  const refreshTimeFormatted = $derived($timestamp(refreshTime));
</script>

<header class="flex flex-col gap-2">
  <div class="flex min-h-10 flex-wrap items-center justify-between gap-2">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="leading-7" data-cy="workers-title">
          {translate('workers.workers')}
        </h1>
        <CountRefreshButton count={$workerCount.newCount} {refresh} />
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
