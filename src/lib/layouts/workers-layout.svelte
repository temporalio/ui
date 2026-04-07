<script lang="ts">
  import type { Snippet } from 'svelte';

  import { page } from '$app/state';

  import Badge from '$lib/holocene/badge.svelte';
  import TabList from '$lib/holocene/tab/tab-list.svelte';
  import Tab from '$lib/holocene/tab/tab.svelte';
  import Tabs from '$lib/holocene/tab/tabs.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    children: Snippet;
    deploymentsHref: string;
    workersHref: string;
  }

  const { children, deploymentsHref, workersHref }: Props = $props();
</script>

<header class="flex flex-col gap-2">
  <h1>
    {translate('workers.workers')}
  </h1>
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
