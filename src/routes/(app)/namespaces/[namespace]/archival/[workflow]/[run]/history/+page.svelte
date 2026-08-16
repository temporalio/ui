<script lang="ts">
  import { page } from '$app/state';

  import type { PageData } from './$types';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import SkeletonWorkflow from '$lib/holocene/skeleton/workflow.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { routeForArchivalWorkflows } from '$lib/utilities/route-for';

  let { data }: { data: PageData } = $props();

  const workflowId = $derived(page.params.workflow);
  const workflowsHref = $derived(
    routeForArchivalWorkflows({ namespace: page.params.namespace }),
  );
</script>

<PageTitle
  title={`${translate('workflows.archival')} | ${workflowId}`}
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
  {page.params.workflow}
</h1>
{#await data.fetchHistory}
  <SkeletonWorkflow />
{:then history}
  {@const groups = groupEvents(history, 'ascending', [], [])}
  <EventSummaryTable items={history} {groups} />
{:catch error}
  <div
    class="mx-auto flex max-w-xl flex-col items-center rounded-panel border border-danger bg-danger/5 px-5 py-8 text-center align-middle"
  >
    <h1 class="font-mono text-5xl font-semibold tracking-tight text-danger">
      {error?.statusCode ?? '500'}
    </h1>
    <p class="mt-2 text-base font-semibold">
      {translate('workflows.workflow-error-title')}
    </p>
    <p class="mt-2 text-sm text-danger">
      {error?.statusText ?? ''}
    </p>
  </div>
{/await}
