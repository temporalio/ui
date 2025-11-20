<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import SkeletonWorkflow from '$lib/holocene/skeleton/workflow.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { routeForArchivalWorkflows } from '$lib/utilities/route-for';

  let { data, params }: PageProps = $props();

  const { namespace, workflow } = $derived(params);
  const workflowsHref = $derived(routeForArchivalWorkflows({ namespace }));
</script>

<PageTitle
  title="{translate('workflows.archival')} | {workflow}"
  url={page.url.href}
/>
<div class="flex items-center justify-between">
  <div class="flex items-center gap-2">
    <Link
      href={workflowsHref}
      data-testid="back-to-archival-workflows"
      icon="chevron-left"
    >
      {translate('workflows.back-to-archived-workflows')}
    </Link>
  </div>
</div>

<h1>
  {workflow}
</h1>
{#await data.fetchHistory}
  <SkeletonWorkflow />
{:then history}
  {@const groups = groupEvents(history, 'ascending', [], [])}
  <EventSummaryTable items={history} {groups} />
{:catch error}
  <div class="text-center align-middle">
    <h1 class="leading-0 text-[12rem] font-semibold">
      {error?.statusCode ?? '500'}
    </h1>
    <p class="-mt-12 text-lg">{translate('workflows.workflow-error-title')}</p>
    <p class="text-2xl font-bold text-red-700">
      {error?.statusText ?? ''}
    </p>
  </div>
{/await}
