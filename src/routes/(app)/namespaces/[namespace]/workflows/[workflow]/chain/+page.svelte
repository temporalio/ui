<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import RunChain from '$lib/components/workflow/run-chain/run-chain.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconArrowUpRight, IconChevronLeft } from '$lib/io/icon';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import {
    routeForWorkflow,
    routeForWorkflows,
  } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace ?? '');
  const workflowId = $derived(page.params.workflow ?? '');
  const runId = $derived(page.url.searchParams.get('run') ?? undefined);
  let focusedRunId = $state('');
  const viewRun = $derived(focusedRunId || runId);
</script>

<PageTitle title={`Run chain | ${workflowId}`} url={page.url.href} />
<div class="flex flex-col gap-4">
  <div class="flex items-center justify-between gap-2">
    <Link
      href={`${routeForWorkflows({ namespace })}?${$workflowsSearchParams}`}
      data-testid="back-to-workflows"
      LeadingIcon={IconChevronLeft}
    >
      {translate('workflows.back-to-workflows')}
    </Link>
    {#if viewRun}
      <Button
        variant="secondary"
        size="sm"
        LeadingIcon={IconArrowUpRight}
        href={routeForWorkflow({
          namespace,
          workflow: workflowId,
          run: viewRun,
        })}
        data-testid="view-focused-run"
      >
        View run
      </Button>
    {/if}
  </div>
  {#key `${namespace}/${workflowId}/${runId ?? ''}`}
    <RunChain {namespace} {workflowId} {runId} bind:focusedRunId />
  {/key}
</div>
